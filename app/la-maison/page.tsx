import type { Metadata } from "next";
import Link from "next/link";
import { CatMark } from "@/components/logo";
import { Diamond } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "La maison",
  description:
    "L’esprit bouillon revisité par FiFi : cuisine française faite maison, prix justes et service continu dans le 9ᵉ arrondissement de Paris.",
  alternates: { canonical: "/la-maison" },
};

const chapters = [
  {
    eyebrow: "L’origine",
    title: "Nourrir Paris, vite et bien",
    body: [
      "Le bouillon naît à Paris au milieu du XIXᵉ siècle. Un boucher a l’idée de servir aux ouvriers des halles un bouillon de viande réconfortant, pour quelques sous, dans une grande salle où tout le monde s’assoit côte à côte.",
      "Le principe fait fureur : une cuisine française sans chichis, servie vite, à un prix que chacun peut s’offrir. C’est cette promesse-là, intacte, que nous reprenons à notre compte.",
    ],
    photo: "facade" as const,
  },
  {
    eyebrow: "La cuisine",
    title: "Des mijotés, tous les jours",
    body: [
      "Le bœuf bourguignon mijote longuement, la soupe à l’oignon est gratinée à la commande, les desserts sortent de notre cuisine. Les grands classiques sont là - œufs mayonnaise, poireaux vinaigrette, confit de canard, crème brûlée.",
      "À côté, quelques écarts assumés : une burrata bien fraîche, des coquillettes crémeuses à la truffe, un burger maison. Le bouillon d’aujourd’hui, pas celui du musée.",
    ],
    photo: "assiette" as const,
  },
  {
    eyebrow: "La salle",
    title: "Ouverte en continu",
    body: [
      "On sert à 15h comme à 22h. Pas de coupure, pas de créneau à négocier : on pousse la porte quand on a faim, ou simplement soif - le comptoir reste ouvert bien après le dessert.",
      "Et de 16h à 22h, les pintes et les cocktails signature passent au tarif happy hour, tous les jours.",
    ],
    photo: "salle" as const,
  },
];

export default function LaMaisonPage() {
  return (
    <>
      <PageHeader
        eyebrow="La maison"
        title="Le bouillon, cette invention parisienne"
        intro="Une idée vieille de cent cinquante ans : bien manger, sans se ruiner, dans une salle qui vit."
      />

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="space-y-20 lg:space-y-24">
          {chapters.map((chapter, index) => (
            <Reveal key={chapter.title} as="article" delay={index * 60}>
              <p className="eyebrow text-gold">{chapter.eyebrow}</p>
              <h2 className="mt-5 font-display text-3xl/[1.12] tracking-tight text-balance sm:text-4xl/[1.1]">
                {chapter.title}
              </h2>
              <div className="mt-6 space-y-5 text-base/relaxed text-pretty text-muted">
                {chapter.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
              <Photo name={chapter.photo} className="mt-10" sizes="(min-width: 768px) 48rem, 100vw" />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24">
          <div className="grain relative overflow-hidden rounded-sm border border-line bg-paper-alt px-8 py-14 text-center shadow-card sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-sm border border-accent/30"
            />
            <div className="relative">
              <CatMark className="mx-auto h-24 opacity-80" />
              <p className="mx-auto mt-8 max-w-md font-display text-2xl/snug text-balance text-ink sm:text-3xl/snug">
                « Chez FiFi, on ne réinvente rien. On le fait simplement bien,
                et tous les jours. »
              </p>
              <div aria-hidden className="rule-ornament mx-auto mt-8 max-w-[12rem]">
                <Diamond />
              </div>
              <p className="eyebrow mt-6 text-muted">
                {site.tagline} · {site.district}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-16 flex flex-wrap justify-center gap-3">
          <Link
            href="/la-carte"
            className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
          >
            Découvrir la carte
          </Link>
          <Link
            href="/nous-trouver"
            className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
          >
            Nous trouver
          </Link>
        </Reveal>
      </div>
    </>
  );
}
