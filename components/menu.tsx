import { Reveal } from "@/components/reveal";
import type { MenuSection } from "@/lib/menu";
import { cn } from "@/lib/utils";

/** Une ligne de carte : intitulé · pointillés · prix. */
export function MenuRow({
  name,
  desc,
  price,
}: {
  name: string;
  desc?: string;
  price?: string;
}) {
  return (
    <li className="py-3.5">
      <div className="flex items-end gap-2">
        <h3 className="font-display text-lg/tight text-ink sm:text-xl/tight">{name}</h3>
        <span aria-hidden className="leader" />
        {price ? (
          <p className="shrink-0 font-display text-lg/tight tabular-nums text-gold sm:text-xl/tight">
            {price}
          </p>
        ) : null}
      </div>
      {desc ? <p className="mt-1.5 max-w-prose text-sm/relaxed text-muted">{desc}</p> : null}
    </li>
  );
}

/** Un bloc de carte complet : titre orné, lignes, mention de bas de section. */
export function MenuSectionBlock({
  section,
  delay = 0,
  className,
}: {
  section: MenuSection;
  delay?: number;
  className?: string;
}) {
  return (
    <Reveal as="section" delay={delay} className={cn("break-inside-avoid", className)}>
      <header className="text-center">
        <h2 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
          {section.title}
        </h2>
        {section.subtitle ? (
          <p className="eyebrow mt-2.5 text-muted">{section.subtitle}</p>
        ) : null}
        <div aria-hidden className="rule-ornament mt-4">
          <Diamond />
        </div>
      </header>

      <ul className="mt-2 divide-y divide-line">
        {section.items.map((item) => (
          <MenuRow key={item.name} {...item} />
        ))}
      </ul>

      {section.note ? (
        <p className="mt-4 text-center text-xs/relaxed text-muted italic">{section.note}</p>
      ) : null}
    </Reveal>
  );
}

export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className={cn("size-2 shrink-0", className)} fill="currentColor">
      <path d="M5 0 10 5 5 10 0 5Z" />
    </svg>
  );
}
