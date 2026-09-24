import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cancelByLink } from "@/lib/reservation-link";

export const dynamic = "force-dynamic";

/**
 * Annulation d'une réservation par son lien.
 *
 * L'identifiant EST le jeton : le connaître prouve qu'on a reçu l'e-mail de
 * confirmation. Il n'est donc pas devinable - mais rien n'empêche d'essayer
 * en masse, d'où la limitation de débit. Sans elle, on pourrait balayer des
 * identifiants au hasard : les chances d'en trouver un sont nulles, mais la
 * charge sur la base, elle, est bien réelle.
 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const verdict = rateLimit(`annulation:${clientIp(_request)}`, 10, 60_000);
  if (!verdict.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Merci de patienter un instant." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
    );
  }

  const done = await cancelByLink(id);

  if (!done) {
    // Lien inconnu, expiré, déjà annulé ou service commencé : une seule
    // réponse, qui ne dit pas lequel de ces cas s'applique.
    return NextResponse.json(
      { error: "Cette réservation ne peut plus être annulée en ligne. Merci de nous appeler." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
