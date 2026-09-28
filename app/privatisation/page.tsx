import type { Metadata } from "next";
import { Diamond } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { Photo } from "@/components/photo";
import { PrivatisationForm } from "@/components/privatisation-form";
import { Reveal } from "@/components/reveal";
import { EVENT_LABELS, EVENT_TYPES, MIN_GUESTS } from "@/lib/privatisation";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privatiser le restaurant",
  description: `Privatiser le bouillon ${site.name}, ${site.district} de ${site.city} : anniversaire, repas d’entreprise, après-travail. Salle complète ou partielle, à partir de ${MIN_GUESTS} personnes.`,
  alternates: { canonical: "/privatisation" },
  // Sans ça, partager cette page affiche le titre générique du site. Or
  // c'est justement une page qu'on envoie par message — « regarde, on peut
  // privatiser ici ».
  openGraph: {
    title: `Privatiser ${site.fullName}`,
    description: `Jusqu’à ${site.privatisation.capacity} personnes, ${site.district} de ${site.city}. Anniversaire, repas d’entreprise, après-travail.`,
    url: "/privatisation",
    type: "website",
  },
};

export default function PrivatisationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privatisation"
        title="Toute la salle pour vous"
        intro={`Un anniversaire, un repas d’équipe, un après-travail. À partir de ${MIN_GUESTS} personnes, ${site.name} se réserve rien que pour vous.`}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <Reveal className="space-y-10">
            <div>
              <h2 className="eyebrow text-gold">La salle</h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {[
                  { term: "Capacité", detail: `Jusqu’à ${site.privatisation.capacity} personnes` },
                  { term: "Formule", detail: site.privatisation.partial },
                  { term: "À partir de", detail: `${MIN_GUESTS} personnes` },
                ].map((row) => (
                  <div key={row.term} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="eyebrow text-muted">{row.term}</dt>
                    <dd className="text-right text-ink">{row.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2 className="eyebrow text-gold">Pour quelles occasions</h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {EVENT_TYPES.filter((t) => t !== "autre").map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-line px-4 py-2 text-sm text-muted"
                  >
                    {EVENT_LABELS[t]}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-base/relaxed text-pretty text-muted">
                La cuisine reste celle du bouillon : les classiques mijotés, servis à votre
                rythme. On adapte le service, pas la maison.
              </p>
            </div>

            <Photo name="salle2" sizes="(min-width: 1024px) 30rem, 100vw" />

            <div aria-hidden className="rule-ornament max-w-xs">
              <Diamond />
            </div>

            <p className="text-base/relaxed text-muted">
              Une question avant d’envoyer ?{" "}
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="font-medium text-brand-accent underline underline-offset-4 decoration-1 hover:decoration-2"
              >
                {site.contact.phoneDisplay}
              </a>
            </p>
          </Reveal>

          <Reveal delay={160}>
            <PrivatisationForm />
          </Reveal>
        </div>
      </div>
    </>
  );
}
