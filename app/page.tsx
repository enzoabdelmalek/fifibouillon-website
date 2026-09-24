import Link from "next/link";
import { CatMark, Logo } from "@/components/logo";
import { Diamond } from "@/components/menu";
import { Photo } from "@/components/photo";
import { Reveal } from "@/components/reveal";
import { signatures } from "@/lib/menu";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <Maison />
      <Signatures />
      <Cartes />
      <HappyHour />
      <Trouver />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-paper-alt text-ink">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <Reveal>
          <Logo className="h-40 sm:h-48 lg:h-56" priority />
        </Reveal>

        <Reveal delay={140}>
          <p className="eyebrow mt-8 text-brand-accent">
            {site.district} · {site.city}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl/[1.08] tracking-tight text-balance sm:text-5xl/[1.06] lg:text-[3.6rem]/[1.05]">
            La cuisine française de toujours, généreuse et à prix juste.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base/relaxed text-pretty text-muted">
            Un bouillon comme on les aime : des classiques mijotés, une salle
            chaleureuse et le service continu, du déjeuner au dernier verre.
          </p>
        </Reveal>

        <Reveal delay={260} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/reserver"
            className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-transform duration-200 hover:-translate-y-0.5"
          >
            Réserver une table
          </Link>
          <Link
            href="/la-carte"
            className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] uppercase transition-colors duration-200 hover:bg-surface"
          >
            Découvrir la carte
          </Link>
        </Reveal>
      </div>

      {/* Bandeau d'arguments, ancré en bas du hero */}
      <div className="relative border-t border-line">
        <ul className="mx-auto flex max-w-6xl flex-col divide-y divide-line px-5 sm:flex-row sm:divide-x sm:divide-y-0 sm:px-8">
          {site.highlights.map((item) => (
            <li
              key={item}
              className="eyebrow flex flex-1 items-center justify-center gap-3 py-4 text-muted"
            >
              <Diamond className="size-1.5 text-brand-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Maison() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-[5fr_6fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow text-gold">La maison</p>
          <h2 className="mt-5 font-display text-3xl/[1.12] tracking-tight text-balance sm:text-4xl/[1.1] lg:text-5xl/[1.08]">
            Le bouillon, cette invention parisienne.
          </h2>
          <div className="mt-7 space-y-5 text-base/relaxed text-pretty text-muted">
            <p>
              Né au XIX<sup>e</sup> siècle pour nourrir Paris vite et bien, le
              bouillon n’a jamais changé de promesse : une cuisine franche,
              servie sans façon, à un prix que tout le monde peut s’offrir.
            </p>
            <p>
              Chez FiFi, on la prolonge à notre manière. Les œufs mayonnaise et
              le bœuf bourguignon côtoient la burrata et les coquillettes à la
              truffe ; le service ne s’arrête pas entre deux heures ; et le
              comptoir reste ouvert bien après le dessert.
            </p>
          </div>
          <Link
            href="/la-maison"
            className="group mt-9 inline-flex items-center gap-3 text-[0.8rem] tracking-[0.16em] text-ink uppercase"
          >
            <span className="border-b border-accent pb-1">Notre histoire</span>
            <span
              aria-hidden
              className="text-accent transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Reveal>

        <Reveal delay={160} className="space-y-8">
          <Photo name="salle" sizes="(min-width: 1024px) 34rem, 100vw" />

          <div className="grain relative overflow-hidden rounded-sm border border-line bg-paper-alt p-8 shadow-card sm:p-12">
            {/* double filet or, à la manière d'un cartouche de menu */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-sm border border-accent/35"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[18px] rounded-sm border border-accent/15"
            />
            <div aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 opacity-10">
              <CatMark className="h-56" />
            </div>

            <div className="relative">
              <p className="eyebrow text-gold">Ce qui nous tient à cœur</p>
              <dl className="mt-8 divide-y divide-line">
                {[
                  {
                    term: "Le fait maison",
                    detail: "Bouillons, mijotés et desserts préparés sur place, chaque jour.",
                  },
                  {
                    term: "Le juste prix",
                    detail: "Des entrées dès 3,90 € et des plats du jour à moins de 14 €.",
                  },
                  {
                    term: "Le service continu",
                    detail: "On vous sert à 15h comme à 22h, sans coupure ni mine renfrognée.",
                  },
                ].map((row) => (
                  <div key={row.term} className="py-5 first:pt-0 last:pb-0">
                    <dt className="font-display text-xl text-ink">{row.term}</dt>
                    <dd className="mt-1.5 text-sm/relaxed text-muted">{row.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Signatures() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal className="text-center">
          <p className="eyebrow text-gold">À la carte</p>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Les incontournables
          </h2>
          <div aria-hidden className="rule-ornament mx-auto mt-7 max-w-xs">
            <Diamond />
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {signatures.map((dish, index) => (
            <li key={dish.name} className="bg-surface">
              <Reveal delay={index * 70} className="flex h-full flex-col p-7 sm:p-9">
                <span aria-hidden className="eyebrow text-accent/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-2xl/tight text-ink">{dish.name}</h3>
                {dish.desc ? (
                  <p className="mt-2 text-sm/relaxed text-muted">{dish.desc}</p>
                ) : null}
                <p className="mt-6 font-display text-xl tabular-nums text-gold">{dish.price}</p>
              </Reveal>
            </li>
          ))}

          <li className="bg-surface">
            <Reveal delay={signatures.length * 70} className="h-full">
              <Link
                href="/la-carte"
                className="group flex h-full flex-col justify-center gap-4 p-7 transition-colors hover:bg-paper-alt sm:p-9"
              >
                <span className="font-display text-2xl/tight text-balance text-ink">
                  Voir la carte complète
                </span>
                <span className="flex items-center gap-3 text-[0.8rem] tracking-[0.16em] text-muted uppercase">
                  Entrées · Plats · Desserts
                  <span
                    aria-hidden
                    className="text-accent transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Cartes() {
  const cards = [
    {
      href: "/la-carte",
      eyebrow: "À manger",
      title: "La carte",
      detail: "Entrées, salades, plats mijotés et desserts maison.",
      pdf: "/Menu%20food.pdf",
    },
    {
      href: "/les-boissons",
      eyebrow: "À boire",
      title: "Les boissons",
      detail: "Cocktails, vins à la verse, bières pression et cafétéria.",
      pdf: "/Menu%20boisson.pdf",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <Reveal key={card.href} delay={index * 120}>
            <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-line bg-surface p-9 shadow-card transition-transform duration-300 hover:-translate-y-1 sm:p-12">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-accent"
              />
              <div>
                <p className="eyebrow text-gold">{card.eyebrow}</p>
                <h2 className="mt-5 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                  {card.title}
                </h2>
                <p className="mt-4 max-w-sm text-sm/relaxed text-muted">{card.detail}</p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-3 text-[0.8rem] tracking-[0.16em] text-ink uppercase after:absolute after:inset-0 after:content-['']"
                >
                  <span className="border-b border-accent pb-1">Consulter</span>
                  <span
                    aria-hidden
                    className="text-accent transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <a
                  href={card.pdf}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="relative z-10 -my-2 py-2 text-[0.8rem] tracking-[0.12em] text-muted uppercase transition-colors hover:text-ink"
                >
                  PDF
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HappyHour() {
  return (
    <section className="border-y border-line bg-paper-alt">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-brand-accent">{site.happyHour.label}</p>
            <p className="mt-6 font-display text-6xl/[0.95] tracking-tight text-brand-accent sm:text-7xl/[0.95] lg:text-[5.5rem]/[0.92]">
              16h
              <span className="mx-3 text-gold">-</span>
              22h
            </p>
            <p className="mt-6 max-w-sm text-base/relaxed text-muted">
              Tous les jours, les pintes et les cocktails signature passent au
              tarif comptoir.
            </p>
          </Reveal>

          <Reveal delay={160} className="grid gap-10 sm:grid-cols-2">
            {[
              { label: "Pintes de bières", items: ["Mutzig 5 €", "Cuvée 7,50 €", "Blanche 7,70 €"] },
              {
                label: "Cocktails à 7,50 €",
                items: ["Moscow Mule", "Gin Tonic", "Caipirinha", "Aperol Spritz", "Cuba Libre"],
              },
            ].map((group) => (
              <div key={group.label}>
                <h3 className="eyebrow border-b border-line-strong pb-3 text-ink">{group.label}</h3>
                <ul className="mt-4 space-y-2.5 text-base text-muted">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Trouver() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow text-gold">Nous trouver</p>
          <h2 className="mt-5 font-display text-3xl/[1.12] tracking-tight text-balance sm:text-4xl/[1.1] lg:text-5xl/[1.08]">
            Une table vous attend dans le&nbsp;{site.district}.
          </h2>
          <address className="mt-8 text-lg/relaxed not-italic text-muted">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </address>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/reserver"
              className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
            >
              Réserver une table
            </Link>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
            >
              Itinéraire
            </a>
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
            >
              {site.contact.phoneDisplay}
            </a>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="rounded-sm border border-line bg-paper-alt p-8 sm:p-10">
            <h3 className="eyebrow text-gold">Horaires</h3>
            <dl className="mt-7 divide-y divide-line">
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
        </Reveal>
      </div>
    </section>
  );
}
