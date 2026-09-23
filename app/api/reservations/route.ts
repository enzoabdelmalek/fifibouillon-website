import { NextResponse } from "next/server";
import { sendReservationEmails } from "@/lib/email";
import {
  MAX_COVERS_PER_SLOT,
  slotToUtc,
  validateReservation,
  type ReservationInput,
} from "@/lib/reservation";
import { getSupabase, type ReservationRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Partial<ReservationInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Revalidation côté serveur : la validation du navigateur se contourne.
  const invalid = validateReservation(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const input = body as ReservationInput;
  const when = slotToUtc(input.date, input.time);

  const supabase = getSupabase();
  if (!supabase.configured) {
    console.error(
      `[reservations] variables d'environnement manquantes : ${supabase.missing.join(", ")}`,
    );
    return NextResponse.json(
      { error: "La réservation en ligne est momentanément indisponible. Merci de nous appeler." },
      { status: 503 },
    );
  }

  // Contrôle de capacité côté serveur. Sur Toscana il était fait dans le
  // navigateur : deux visiteurs pouvaient réserver la dernière table en même
  // temps, et un formulaire modifié passait outre.
  const slotStart = when.toISOString();
  const slotEnd = new Date(when.getTime() + 60_000).toISOString();

  const { data: existing, error: readError } = await supabase.client
    .from("reservations")
    .select("guests")
    .eq("business_id", supabase.businessId)
    .eq("status", "scheduled")
    .gte("date", slotStart)
    .lt("date", slotEnd);

  if (readError) {
    console.error("[reservations] lecture :", readError.message);
    return NextResponse.json(
      { error: "Impossible de vérifier les disponibilités. Merci de réessayer." },
      { status: 502 },
    );
  }

  const taken = ((existing ?? []) as { guests: number | null }[]).reduce(
    (total, row) => total + (row.guests ?? 1),
    0,
  );

  if (taken + input.guests > MAX_COVERS_PER_SLOT) {
    return NextResponse.json(
      { error: "Ce créneau vient d’être complété. Merci d’en choisir un autre." },
      { status: 409 },
    );
  }

  const row: ReservationRow = {
    business_id: supabase.businessId,
    customer_name: input.name.trim(),
    customer_phone: input.phone.trim(),
    customer_mail: input.email.trim().toLowerCase(),
    date: when.toISOString(),
    guests: input.guests,
    message: input.message?.trim() || null,
    status: "scheduled",
    attended: null,
  };

  const { error: insertError } = await supabase.client.from("reservations").insert(row);

  if (insertError) {
    console.error("[reservations] insertion :", insertError.message);
    return NextResponse.json(
      { error: "Nous n’avons pas pu enregistrer la réservation. Merci de nous appeler." },
      { status: 502 },
    );
  }

  // La table est réservée : un e-mail qui échoue ne doit pas faire croire
  // le contraire au client. On signale seulement que l'accusé n'est pas parti.
  const emails = await sendReservationEmails(input);

  return NextResponse.json({ ok: true, emailSent: emails.sent });
}
