import type { Metadata } from "next";
import { MenuSectionBlock } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { foodMenu } from "@/lib/menu";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "La carte",
  description:
    "Entrées, salades, plats mijotés et desserts maison du bouillon FiFi, dans le 9ᵉ arrondissement de Paris. Œufs mayonnaise, bœuf bourguignon, confit de canard, crème brûlée.",
  alternates: { canonical: "/la-carte" },
};

export default function LaCartePage() {
  return (
    <>
      <PageHeader
        eyebrow="À manger"
        title="La carte"
        intro="Les classiques du bouillon, mijotés chaque jour sur place. Servis sans interruption, du déjeuner au dîner."
      />

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="space-y-20 lg:space-y-24">
          {foodMenu.map((section, index) => (
            <MenuSectionBlock key={section.title} section={section} delay={index * 60} />
          ))}
        </div>

        <Reveal className="mt-20 border-t border-line pt-10 text-center">
          <p className="text-sm/relaxed text-muted">
            Prix en euros, taxes et service compris. La carte évolue au fil des
            saisons et des arrivages.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href="/Menu%20food.pdf"
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
