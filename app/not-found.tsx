import Link from "next/link";
import { CatMark } from "@/components/logo";
import { Diamond } from "@/components/menu";

/**
 * Page 404.
 *
 * Elle renvoie un vrai code 404 - jamais un 200 déguisé, qui ferait indexer
 * des pages vides par Google.
 *
 * Plutôt qu'un seul retour à l'accueil, elle propose les destinations utiles :
 * quelqu'un qui atterrit ici vient souvent d'un lien périmé ou d'une faute de
 * frappe, et cherche la carte, l'adresse ou une table. Le renvoyer à la case
 * départ lui fait refaire le chemin.
 */
const DESTINATIONS = [
  { href: "/la-carte", label: "La carte", detail: "Entrées, plats, desserts" },
  { href: "/les-boissons", label: "Les boissons", detail: "Cocktails, vins, bières" },
  { href: "/nous-trouver", label: "Nous trouver", detail: "Adresse et horaires" },
];

export default function NotFound() {
  return (
    <section className="grain relative overflow-hidden bg-paper-alt pt-[72px] text-ink">
      <div className="relative mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <CatMark className="mx-auto h-28 opacity-25 [filter:brightness(0)] dark:opacity-30 dark:[filter:brightness(0)_invert(1)]" />

        <p className="eyebrow mt-10 text-brand-accent">Erreur 404</p>
        <h1 className="mt-5 font-display text-4xl/[1.08] tracking-tight text-balance sm:text-5xl/[1.06]">
          Cette page a filé comme un chat.
        </h1>
        <p className="mt-6 text-base/relaxed text-muted">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>

        <div aria-hidden className="rule-ornament mx-auto mt-10 max-w-xs">
          <Diamond />
        </div>

        <nav aria-label="Pages principales" className="mt-10">
          <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line text-left sm:grid-cols-3">
            {DESTINATIONS.map((item) => (
              <li key={item.href} className="bg-surface">
                <Link
                  href={item.href}
                  className="group block h-full px-6 py-5 transition-colors hover:bg-paper-alt"
                >
                  <span className="font-display text-xl text-ink">{item.label}</span>
                  <span className="mt-1 block text-sm/relaxed text-muted">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/reserver"
            className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
          >
            Réserver une table
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-surface"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
