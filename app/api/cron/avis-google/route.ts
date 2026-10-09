import { NextResponse } from "next/server";
import { sendReviewRequest } from "@/lib/email";
import { env } from "@/lib/env";
import { firstNameOf } from "@/lib/reservation";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** On écrit au client trois heures après l'heure de sa réservation. */
const DELAY_MS = 3 * 60 * 60_000;

/**
 * Fenêtre de rattrapage. Le déclencheur (GitHub Actions, toutes les 15 min)
 * prend parfois une heure de retard : une fenêtre de six heures absorbe ces
 * retards sans qu'une réservation passe entre deux exécutions.
 *
 * Elle doit rester sous 24 h : au-delà, la clé d'idempotence de Resend a
 * expiré et le client recevrait l'e-mail deux fois.
 */
const WINDOW_MS = 6 * 60 * 60_000;

/**
 * Demande d'avis Google, trois heures après le passage du client.
 *
 * Couvre toutes les réservations du restaurant, celles du site comme celles
 * saisies dans le dashboard. Sont écartées les annulations et les absences
 * constatées (colonne `attended = false`) : demander un avis à quelqu'un qui n'est
 * pas venu, c'est l'inviter à en laisser un mauvais.
 */
export async function GET(request: Request) {
  const secret = env.cronSecret();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase.configured) {
    console.error(`[avis] variables manquantes : ${supabase.missing.join(", ")}`);
    return NextResponse.json({ error: "Configuration incomplète" }, { status: 503 });
  }

  const latest = new Date(Date.now() - DELAY_MS);
  const earliest = new Date(latest.getTime() - WINDOW_MS);

  const { data, error } = await supabase.client
    .from("reservations")
    .select("id, customer_name, customer_mail")
    .eq("business_id", supabase.businessId)
    // « attended » : le dashboard a noté le client comme venu. C'est le
    // meilleur candidat à un avis - l'oublier, c'est écrire à tout le monde
    // sauf à ceux dont on est sûr qu'ils ont mangé ici.
    .in("status", ["scheduled", "attended"])
    .or("attended.is.null,attended.eq.true")
    .gte("date", earliest.toISOString())
    .lte("date", latest.toISOString());

  if (error) {
    console.error("[avis] lecture :", error.message);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  let sent = 0;
  let sansMail = 0;
  const failed: string[] = [];

  for (const row of data ?? []) {
    const email = row.customer_mail?.trim();
    if (!email) {
      sansMail++;
      continue;
    }
    if (await sendReviewRequest(row.id, email, firstNameOf(row.customer_name))) sent++;
    else failed.push(row.id);
  }

  // « sent » compte aussi les envois dédoublonnés par Resend : un passage
  // qui retombe sur une réservation déjà traitée ne la renvoie pas.
  return NextResponse.json({ total: data?.length ?? 0, sent, sansMail, failed: failed.length });
}
