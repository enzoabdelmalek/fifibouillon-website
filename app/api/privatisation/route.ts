import { NextResponse } from "next/server";
import { sendPrivatisationEmails } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  composeRequest,
  validatePrivatisation,
  type PrivatisationInput,
} from "@/lib/privatisation";
import { getSupabase, type QuoteRow } from "@/lib/supabase";
import { retrouverOuCreerClient } from "@/lib/clients";
import { EVENT_LABELS } from "@/lib/privatisation";

export const dynamic = "force-dynamic";

/* Une privatisation se demande une fois, pas dix. Plus strict qu'une
   réservation : personne n'a besoin d'en envoyer trois d'affilée. */
const BURST = { limit: 2, windowMs: 60_000 };
const HOURLY = { limit: 5, windowMs: 60 * 60_000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  for (const [nom, regle] of [
    ["rafale", BURST],
    ["heure", HOURLY],
  ] as const) {
    const verdict = rateLimit(`privatisation:${nom}:${ip}`, regle.limit, regle.windowMs);
    if (!verdict.allowed) {
      return NextResponse.json(
        { error: "Trop de demandes. Merci de patienter un instant, ou de nous appeler." },
        { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
      );
    }
  }

  let body: Partial<PrivatisationInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Revalidation côté serveur : celle du navigateur se contourne.
  const invalide = validatePrivatisation(body);
  if (invalide) return NextResponse.json({ error: invalide }, { status: 400 });

  const input = body as PrivatisationInput;

  const supabase = getSupabase();
  if (!supabase.configured) {
    console.error(`[privatisation] variables manquantes : ${supabase.missing.join(", ")}`);
    return NextResponse.json(
      { error: "L’envoi est momentanément indisponible. Merci de nous appeler." },
      { status: 503 },
    );
  }

  /*
   * La fiche client d'abord, et ici elle est BLOQUANTE.
   *
   * Contrairement à une réservation, `quotes.customer_id` n'accepte pas le
   * vide : une demande est toujours rattachée à quelqu'un. C'est tenable
   * parce que ce formulaire exige le nom, l'e-mail ET le téléphone — donc
   * `retrouverOuCreerClient` a toujours de quoi rapprocher, et ne peut
   * rendre `null` que sur une vraie panne.
   *
   * On s'arrête donc plutôt que d'insérer : une demande sans destinataire
   * est exactement ce qu'on cherche à éviter.
   */
  const fiche = await retrouverOuCreerClient(supabase.client, supabase.businessId, {
    nom: input.name.trim(),
    telephone: input.phone,
    email: input.email,
    source: "quote",
  });

  if (!fiche.id) {
    console.error("[privatisation] fiche client :", fiche.erreur ?? "aucun identifiant rendu");
    return NextResponse.json(
      { error: "Nous n’avons pas pu enregistrer votre demande. Merci de nous appeler." },
      { status: 502 },
    );
  }

  // Le récapitulatif est composé ICI, pas dans le formulaire : c'est la seule
  // version qui arrive en base, donc la seule qui fasse foi.
  //
  // `request_details` garde EN PLUS les champs bruts. Le texte est ce que
  // FiFi lit ; le jsonb est ce qui restera exploitable — compter les
  // demandes d'afterwork sur un trimestre, voir la taille moyenne des
  // groupes — sans avoir à réanalyser des phrases françaises.
  const row: QuoteRow = {
    business_id: supabase.businessId,
    customer_id: fiche.id,
    status: "request",
    title: `Privatisation — ${EVENT_LABELS[input.eventType]} (${input.guests} personnes)`,
    request_message: composeRequest(input),
    request_details: {
      type: input.eventType,
      personnes: input.guests,
      date_souhaitee: input.date ?? null,
      message: input.message?.trim() || null,
      telephone: input.phone.trim(),
    },
  };

  const { error } = await supabase.client.from("quotes").insert(row);

  if (error) {
    console.error("[privatisation] insertion :", error.message);
    return NextResponse.json(
      { error: "Nous n’avons pas pu enregistrer votre demande. Merci de nous appeler." },
      { status: 502 },
    );
  }

  // La demande est enregistrée : un e-mail qui échoue ne doit pas laisser
  // croire le contraire au visiteur.
  const emails = await sendPrivatisationEmails(input);

  return NextResponse.json({ ok: true, emailSent: emails.sent });
}
