import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Diamond } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { CancelButton } from "@/components/cancel-reservation";
import { findByLink } from "@/lib/reservation-link";
import { site } from "@/lib/site";

/**
 * Une réservation, consultée par son lien.
 *
 * Jamais indexée, jamais mise en cache : elle dépend d'un identifiant et
 * contient des données personnelles.
 */
export const metadata: Metadata = {
  title: "Votre réservation",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmee?: string; mail?: string }>;
}) {
  const { id } = await params;
  const { confirmee, mail } = await searchParams;
  const reservation = await findByLink(id);

  // Lien inconnu, identifiant mal formé ou service passé : la même réponse
  // dans les trois cas. Une réponse différente dirait lesquels existent.
  if (!reservation) notFound();

  const when = new Date(reservation.date);
  const jour = when.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
  const heure = when
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })
    .replace(":", "h");

  // On arrive du formulaire : c'est le moment le plus important du parcours,
  // il mérite d'être marqué. Revenir plus tard par l'e-mail donne la même
  // page, en plus sobre.
  const juste = confirmee === "1" && !reservation.cancelled;

  return (
    <>
      <PageHeader
        eyebrow={
          reservation.cancelled
            ? "Réservation annulée"
            : juste
              ? "Votre table est réservée"
              : "Votre réservation"
        }
        title={
          reservation.cancelled
            ? "Cette table a été libérée"
            : `À très bientôt${reservation.firstName ? `, ${reservation.firstName}` : ""}.`
        }
        intro={
          reservation.cancelled
            ? "Nous serons heureux de vous accueillir une autre fois."
            : juste
              ? mail === "ko"
                ? "Votre table est retenue. L’e-mail de confirmation n’a pas pu partir, mais gardez cette page : c’est ici que vous pourrez annuler."
                : "Un e-mail de confirmation vient de vous être envoyé. Il contient le lien de cette page."
              : undefined
        }
      />

      <div className="mx-auto max-w-xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="rounded-sm border border-line bg-surface p-8 shadow-card sm:p-10">
          <h2 className="eyebrow text-gold">Le détail</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {[
              { label: "Date", value: jour },
              { label: "Heure", value: heure },
              {
                label: "Convives",
                value: `${reservation.guests} ${reservation.guests > 1 ? "personnes" : "personne"}`,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="eyebrow text-muted">{row.label}</dt>
                <dd className="text-right font-display text-xl text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>

          {reservation.cancellable ? (
            <>
              <p className="mt-8 text-sm/relaxed text-muted">
                Un empêchement ? Annulez ici, la table sera aussitôt rendue disponible.
              </p>
              <CancelButton id={reservation.id} />
            </>
          ) : (
            <p className="mt-8 text-sm/relaxed text-muted">
              {reservation.cancelled
                ? "Cette réservation est annulée. Pour revenir, il suffit d’en prendre une nouvelle."
                : "L’heure approche : pour toute modification, appelez-nous directement."}
            </p>
          )}

          <p className="mt-6 text-sm/relaxed text-muted">
            Une question ?{" "}
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="font-medium text-brand-accent underline underline-offset-4"
            >
              {site.contact.phoneDisplay}
            </a>
          </p>
        </div>

        <div aria-hidden className="rule-ornament mx-auto mt-12 max-w-xs">
          <Diamond />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </>
  );
}
