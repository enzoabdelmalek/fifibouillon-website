import type { Metadata } from "next";
import { Diamond } from "@/components/menu";
import { MenuTabs, type MenuGroup } from "@/components/menu-tabs";
import { PageHeader } from "@/components/page-header";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/reveal";
import { beersAndSpirits, cocktails, happyHour, snacks, softDrinks, wines } from "@/lib/menu";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Les boissons",
  description:
    "Cocktails signature, vins à la verse, bières pression, apéritifs et cafétéria. Happy hour tous les jours de 16h à 22h au bouillon FiFi, Paris 9ᵉ.",
  alternates: { canonical: "/les-boissons" },
};

/**
 * La carte des boissons compte une centaine de références : regroupées en six
 * familles, chacune tient sur un écran ou deux.
 */
const groups: MenuGroup[] = [
  { id: "cocktails", label: "Cocktails", sections: [cocktails[0]] },
  { id: "sans-alcool", label: "Sans alcool", sections: [cocktails[1]] },
  { id: "vins", label: "Vins", sections: wines },
  { id: "bieres", label: "Bières", sections: beersAndSpirits },
  { id: "softs", label: "Softs", sections: softDrinks },
  { id: "pouce", label: "Sur le pouce", sections: [snacks] },
];

export default function LesBoissonsPage() {
  return (
    <>
      <PageHeader
        eyebrow="À boire"
        title="Les boissons"
        intro="Du café du matin au dernier cocktail : une carte de comptoir, courte et bien faite."
      />

      <HappyHourBanner />

      <MenuTabs groups={groups} />

      <div className="mx-auto max-w-3xl px-5 pb-20 sm:px-8 lg:pb-28">
        {/* Le comptoir ferme la page, là où la carte s'arrête et où l'on commande. */}
        <Reveal className="mt-16">
          <Photo name="comptoir" className="mx-auto max-w-sm" sizes="(min-width: 640px) 24rem, 100vw" />
        </Reveal>

        <Reveal className="mt-20 border-t border-line pt-10 text-center">
          <p className="text-sm/relaxed text-muted">
            Prix en euros, taxes et service compris. L’abus d’alcool est dangereux
            pour la santé — à consommer avec modération.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/Menu%20boisson.pdf"
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
            >
              Télécharger la carte (PDF)
            </a>
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
            >
              Nous appeler
            </a>
          </div>
        </Reveal>
      </div>
    </>
  );
}

function HappyHourBanner() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-sm border border-primary/30 bg-paper-alt p-8 sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-display text-2xl text-brand-accent sm:text-3xl">{happyHour.title}</h2>
            <p className="eyebrow text-gold">{happyHour.schedule}</p>
          </div>

          <div aria-hidden className="rule-ornament my-7">
            <Diamond />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {happyHour.groups.map((group) => (
              <div key={group.label}>
                <h3 className="eyebrow text-muted">{group.label}</h3>
                <ul className="mt-4 space-y-2 text-base text-ink">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
