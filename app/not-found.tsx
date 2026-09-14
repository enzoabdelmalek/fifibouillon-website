import Link from "next/link";
import { CatMark } from "@/components/logo";

export default function NotFound() {
  return (
    <section className="grain relative flex min-h-[80svh] items-center overflow-hidden bg-paper-alt pt-[72px] text-ink">
      <div className="relative mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <CatMark className="mx-auto h-28 opacity-70" />
        <p className="eyebrow mt-10 text-brand-accent">Erreur 404</p>
        <h1 className="mt-5 font-display text-4xl/[1.08] tracking-tight text-balance sm:text-5xl/[1.06]">
          Cette page a filé comme un chat.
        </h1>
        <p className="mt-6 text-base/relaxed text-muted">
          La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
        >
          Retour à l’accueil
        </Link>
      </div>
    </section>
  );
}
