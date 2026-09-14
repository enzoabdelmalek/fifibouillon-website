"use client";

import { useId, useRef, useState } from "react";
import { MenuSectionBlock } from "@/components/menu";
import type { MenuSection } from "@/lib/menu";
import { cn } from "@/lib/utils";

export type MenuGroup = {
  id: string;
  label: string;
  sections: MenuSection[];
};

/**
 * Carte présentée par onglets : une famille à la fois, au lieu d'une colonne
 * de 90 lignes où l'on se perd.
 *
 * Tous les panneaux sont rendus dans le HTML — seul l'affichage est basculé.
 * Google indexe donc la carte entière, et sans JavaScript la page reste
 * complète (le masquage est conditionné à la classe `js`, cf. globals.css).
 */
export function MenuTabs({ groups }: { groups: MenuGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id);
  const baseId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const anchorRef = useRef<HTMLDivElement>(null);

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  function select(id: string, { focus = false } = {}) {
    setActiveId(id);

    if (focus) tabRefs.current.get(id)?.focus();
    tabRefs.current.get(id)?.scrollIntoView({ block: "nearest", inline: "center" });

    // Si la barre d'onglets est sortie par le haut, on la ramène : sinon on
    // atterrit au milieu du nouveau panneau, voire dans le vide.
    const anchor = anchorRef.current;
    if (!anchor) return;
    const stickyOffset = window.innerWidth >= 1024 ? 80 : 72;
    if (anchor.getBoundingClientRect().top < stickyOffset) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = groups.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    select(groups[next].id, { focus: true });
  }

  return (
    <>
      {/* Ancre de remontée : placée avant la barre collante. */}
      <div ref={anchorRef} className="scroll-mt-[72px] lg:scroll-mt-20" />

      {/* Barre pleine largeur : collante sous l'en-tête, elle masque le contenu
          qui défile dessous. */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-paper/92 backdrop-blur-md lg:top-20">
        <div
          role="tablist"
          aria-label="Familles de la carte"
          aria-orientation="horizontal"
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] sm:px-8 lg:justify-center [&::-webkit-scrollbar]:hidden"
        >
          {groups.map((group, index) => {
            const active = group.id === activeId;
            return (
              <button
                key={group.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(group.id, node);
                  else tabRefs.current.delete(group.id);
                }}
                type="button"
                role="tab"
                id={tabId(group.id)}
                aria-selected={active}
                aria-controls={panelId(group.id)}
                tabIndex={active ? 0 : -1}
                onClick={() => select(group.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[0.75rem] tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200",
                  active
                    ? "bg-primary text-on-primary"
                    : "text-muted hover:bg-paper-alt hover:text-ink",
                )}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      {groups.map((group) => {
        const active = group.id === activeId;
        return (
          <div
            key={group.id}
            role="tabpanel"
            id={panelId(group.id)}
            aria-labelledby={tabId(group.id)}
            data-menu-panel={active ? "true" : "false"}
            tabIndex={0}
            className="mx-auto max-w-3xl space-y-16 px-5 pt-14 sm:px-8 lg:space-y-20 lg:pt-16"
          >
            {group.sections.map((section) => (
              <MenuSectionBlock key={section.title} section={section} animate={false} />
            ))}
          </div>
        );
      })}
    </>
  );
}
