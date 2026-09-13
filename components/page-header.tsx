import { CatMark } from "@/components/logo";
import { Diamond } from "@/components/menu";

/**
 * Bandeau de titre bordeaux ouvrant chaque page intérieure.
 * Il donne à l'en-tête fixe un fond sombre sur lequel flotter.
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
    <section className="grain relative overflow-hidden bg-[#6b0b0c] pt-[72px] text-[#fff8ca] lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-10 opacity-[0.09] sm:right-4"
      >
        <CatMark className="h-64 sm:h-80" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 lg:py-24">
        <p className="eyebrow text-[#c8920e]">{eyebrow}</p>
        <h1 className="mt-5 font-display text-4xl/[1.05] tracking-tight text-balance sm:text-5xl/[1.05] lg:text-6xl/[1.05]">
          {title}
        </h1>
        {intro ? (
          <p className="mx-auto mt-6 max-w-xl text-base/relaxed text-pretty text-[#fff8ca]/70">
            {intro}
          </p>
        ) : null}
        <div aria-hidden className="rule-ornament mx-auto mt-8 max-w-xs text-[#c8920e]">
          <Diamond />
        </div>
      </div>
    </section>
  );
}
