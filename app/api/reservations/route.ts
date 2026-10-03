import { NextResponse } from "next/server";
import { sendReservationEmails } from "@/lib/email";
import {
  MAX_COVERS_PER_SLOT,
  composeMessage,
  isGroupRequest,
  slotToUtc,
  validateReservation,
  type ReservationInput,
} from "@/lib/reservation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { getSupabase, STATUTS_LIBERES, type ReservationRow } from "@/lib/supabase";
import { retrouverOuCreerClient } from "@/lib/clients";

export const dynamic = "force-dynamic";

/* Une vraie personne réserve une table, pas quinze. Deux plafonds : un
   court, contre la rafale, et un long, contre le remplissage patient du
   carnet. Le premier atteint suffit à refuser. */
const BURST = { limit: 3, windowMs: 60_000 };
const HOURLY = { limit: 8, windowMs: 60 * 60_000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  for (const [name, rule] of [["rafale", BURST], ["heure", HOURLY]] as const) {
    const verdict = rateLimit(`reservation:${name}:${ip}`, rule.limit, rule.windowMs);
    if (!verdict.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Merci de patienter un instant, ou de nous appeler." },
        { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
      );
    }
  }

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
    .select("party_size")
    .eq("business_id", supabase.businessId)
    // Voir la route des disponibilités : on énumère ce qui LIBÈRE la table,
    // pas ce qui l'occupe.
    .not("status", "in", `(${STATUTS_LIBERES.join(",")})`)
    .gte("starts_at", slotStart)
    .lt("starts_at", slotEnd);

  if (readError) {
    console.error("[reservations] lecture :", readError.message);
    return NextResponse.json(
      { error: "Impossible de vérifier les disponibilités. Merci de réessayer." },
      { status: 502 },
    );
  }

  const taken = ((existing ?? []) as { party_size: number | null }[]).reduce(
    (total, row) => total + (row.party_size ?? 1),
    0,
  );

  if (taken + input.guests > MAX_COVERS_PER_SLOT) {
    // Un groupe qui ne rentre pas mérite mieux que « créneau complet » : la
    // salle peut souvent l'accueillir en déplaçant des tables, ce qu'un
    // formulaire ne sait pas arbitrer. On renvoie vers le téléphone.
    const error = isGroupRequest(input.guests)
      ? `Ce créneau n’a plus la place pour ${input.guests} convives. Appelez-nous au ${site.contact.phoneDisplay}, nous trouverons une solution.`
      : "Ce créneau vient d’être complété. Merci d’en choisir un autre.";
    return NextResponse.json({ error }, { status: 409 });
  }

  /*
   * La fiche client d'abord — mais son échec N'ANNULE PAS la réservation.
   *
   * `reservations.customer_id` accepte le vide, et `guest_name` porte alors
   * le nom. Perdre le rattachement au fichier clients est ennuyeux ; refuser
   * la table d'un client un samedi soir ne l'est pas du tout.
   */
  const fiche = await retrouverOuCreerClient(supabase.client, supabase.businessId, {
    nom: input.name.trim(),
    telephone: input.phone,
    email: input.email,
  });
  if (fiche.erreur) console.error("[reservations] fiche client :", fiche.erreur);

  const row: ReservationRow = {
    business_id: supabase.businessId,
    customer_id: fiche.id,
    guest_name: input.name.trim(),
    starts_at: when.toISOString(),
    party_size: input.guests,
    customer_message: composeMessage(input),
    status: "confirmed",
    source: "website",
  };

  // On récupère l'identifiant : il sert de jeton dans le lien de suivi envoyé
  // par e-mail. Impossible à deviner (UUID v4), donc il tient lieu de preuve
  // que le porteur du lien est bien celui qui a réservé.
  const { data: created, error: insertError } = await supabase.client
    .from("reservations")
    .insert(row)
    .select("id")
    .single();

  if (insertError) {
    console.error("[reservations] insertion :", insertError.message);
    return NextResponse.json(
      { error: "Nous n’avons pas pu enregistrer la réservation. Merci de nous appeler." },
      { status: 502 },
    );
  }

  // La table est réservée : un e-mail qui échoue ne doit pas faire croire
  // le contraire au client. On signale seulement que l'accusé n'est pas parti.
  const emails = await sendReservationEmails(input, created?.id ?? null);

  // L'identifiant repart au navigateur : c'est lui qui sert d'adresse à la
  // page de confirmation. S'il manque - insertion réussie mais lecture en
  // échec - le formulaire retombe sur son récapitulatif en place.
  return NextResponse.json({
    ok: true,
    id: created?.id ?? null,
    emailSent: emails.sent,
  });
}
