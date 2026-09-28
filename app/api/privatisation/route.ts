import { NextResponse } from "next/server";
import { sendPrivatisationEmails } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  composeRequest,
  validatePrivatisation,
  type PrivatisationInput,
} from "@/lib/privatisation";
import { getSupabase, type QuoteRow } from "@/lib/supabase";

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

  // Le récapitulatif est composé ICI, pas dans le formulaire : c'est la seule
  // version qui arrive en base, donc la seule qui fasse foi.
  const row: QuoteRow = {
    business_id: supabase.businessId,
    customer_name: input.name.trim(),
    customer_email: input.email.trim().toLowerCase(),
    customer_phone: input.phone.trim(),
    message: composeRequest(input),
    status: "pending",
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
