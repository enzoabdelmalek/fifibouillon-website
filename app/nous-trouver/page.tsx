import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nous trouver",
  description: `Adresse, horaires et contact du bouillon FiFi, ${site.district} de ${site.city}. Service continu et happy hour de 16h à 22h.`,
  alternates: { canonical: "/nous-trouver" },
};

export default function NousTrouverPage() {
  const tel = `tel:${site.contact.phone.replace(/\s/g, "")}`;

  return (
    <>
      <PageHeader
        eyebrow="Nous trouver"
        title="Adresse & horaires"
        intro={`FiFi vous accueille dans le ${site.district} de ${site.city}, en service continu.`}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <Reveal>
            <div className="rounded-sm border border-line bg-surface p-8 shadow-card sm:p-10">
              <h2 className="eyebrow text-gold">L’adresse</h2>
              <address className="mt-6 font-display text-2xl/snug not-italic text-ink sm:text-3xl/snug">
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>

              <dl className="mt-8 divide-y divide-line border-y border-line">
                {site.transport.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="eyebrow text-muted">{row.label}</dt>
                    <dd className="text-right text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
              >
                Ouvrir dans Google Maps
              </a>
            </div>
          </Reveal>

          <Reveal delay={140} className="space-y-6">
            {/* La devanture : c'est elle qu'on cherche du regard en arrivant. */}
            <Photo name="facade" sizes="(min-width: 1024px) 34rem, 100vw" />

            <div className="rounded-sm border border-line bg-paper-alt p-8 sm:p-10">
              <h2 className="eyebrow text-gold">Horaires</h2>
              <dl className="mt-6 divide-y divide-line">
                {site.hours.map((slot) => (
                  <div key={slot.days} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="font-display text-lg text-ink">{slot.days}</dt>
                    <dd className="tabular-nums text-muted">{slot.value}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="font-display text-lg text-gold">{site.happyHour.label}</dt>
                  <dd className="text-muted">{site.happyHour.value}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-sm border border-line bg-surface p-8 shadow-card sm:p-10">
              <h2 className="eyebrow text-gold">Nous contacter</h2>
              <p className="mt-6 text-sm/relaxed text-muted">
                Une question, un groupe à installer, une privatisation ? Le plus
                simple reste le téléphone — on décroche pendant le service.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={tel}
                  className="rounded-full border border-line-strong px-7 py-3.5 text-center text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
                >
                  {site.contact.phoneDisplay}
                </a>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="rounded-full border border-line-strong px-7 py-3.5 text-center text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
                >
                  Écrire un e-mail
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
