import { CatMark } from "@/components/logo";
import { Diamond } from "@/components/menu";

/**
 * Bandeau de titre ouvrant chaque page intérieure.
 * Fond jaune beurre (couleur primaire) : le rouge n'intervient qu'en accent
 * sur le surtitre et le filet orné.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="grain relative overflow-hidden border-b border-line bg-paper-alt pt-[72px] text-ink lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-10 opacity-[0.07] sm:right-4"
      >
        <CatMark className="h-64 sm:h-80" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 lg:py-24">
        <p className="eyebrow text-brand-accent">{eyebrow}</p>
        <h1 className="mt-5 font-display text-4xl/[1.05] tracking-tight text-balance sm:text-5xl/[1.05] lg:text-6xl/[1.05]">
          {title}
        </h1>
        {intro ? (
          <p className="mx-auto mt-6 max-w-xl text-base/relaxed text-pretty text-muted">{intro}</p>
        ) : null}
        <div aria-hidden className="rule-ornament mx-auto mt-8 max-w-xs">
          <Diamond />
        </div>
      </div>
    </section>
  );
}
