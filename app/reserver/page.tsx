import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { ReservationForm } from "@/components/reservation-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réserver une table",
  description: `Réservez votre table au bouillon FiFi, ${site.address.street}, ${site.district} de ${site.city}. Réservation en ligne, service continu et happy hour de 16h à 22h.`,
  alternates: { canonical: "/reserver" },
};

export default function ReserverPage() {
  return (
    <>
      <PageHeader
        eyebrow="Réservation"
        title="Réserver une table"
        intro="Quelques secondes suffisent. Vous recevez la confirmation par e-mail dans la foulée."
      />

      <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <Reveal className="lg:order-2">
            <ReservationForm />
          </Reveal>

          <Reveal delay={120} className="lg:order-1">
            <div className="rounded-sm border border-line bg-paper-alt p-8 sm:p-10">
              <h2 className="eyebrow text-brand-accent">Informations pratiques</h2>

              <dl className="mt-7 space-y-7">
                <div>
                  <dt className="font-display text-lg text-ink">Horaires</dt>
                  <dd className="mt-2 space-y-1 text-sm/relaxed text-muted">
                    {site.hours.map((slot) => (
                      <p key={slot.days} className="flex justify-between gap-4">
                        <span>{slot.days}</span>
                        <span className="tabular-nums">{slot.value}</span>
                      </p>
                    ))}
                    <p className="pt-2 text-brand-accent">
                      {site.happyHour.label} — {site.happyHour.value}
                    </p>
                  </dd>
                </div>

                <div>
                  <dt className="font-display text-lg text-ink">Adresse</dt>
                  <dd className="mt-2 text-sm/relaxed text-muted">
                    {site.address.street}
                    <br />
                    {site.address.postalCode} {site.address.city}
                    <br />
                    <a
                      href={site.mapsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-block text-brand-accent underline underline-offset-4"
                    >
                      Voir l’itinéraire
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-display text-lg text-ink">Une question ?</dt>
                  <dd className="mt-2 text-sm/relaxed text-muted">
                    Pour un groupe, une privatisation ou une demande particulière,
                    le téléphone reste le plus simple.
                    <br />
                    <a
                      href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                      className="mt-2 inline-block text-brand-accent underline underline-offset-4"
                    >
                      {site.contact.phoneDisplay}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
