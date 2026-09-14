"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export const THEME_STORAGE_KEY = "fifi-theme";

/** Couleurs de l'interface du navigateur (barre d'adresse mobile) par thème. */
const THEME_COLOR = { light: "#fffdf6", dark: "#17120f" } as const;

/**
 * Script injecté dans le <head> pour appliquer le thème avant le premier
 * rendu — sans lui, un flash apparaît au chargement.
 *
 * Le site démarre TOUJOURS en clair : la préférence système n'est pas suivie.
 * Le mode sombre ne s'applique que si le visiteur l'a explicitement choisi.
 *
 * Le script pose aussi la classe `js` sur <html> : les animations d'apparition
 * et les onglets de carte ne masquent leur contenu que si JavaScript est
 * actif (sans JS, tout reste visible).
 */
export const themeInitScript = `(function(){
var r=document.documentElement;r.classList.add("js");
var d=false;try{d=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==="dark";}catch(e){}
r.classList.toggle("dark",d);
var set=function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?${JSON.stringify(
  THEME_COLOR.dark,
)}:${JSON.stringify(THEME_COLOR.light)});};
set();document.addEventListener("DOMContentLoaded",set);
})();`.replace(/\n/g, "");

/**
 * Le thème vit dans la classe `dark` de <html> — une source de vérité
 * extérieure à React. On s'y abonne plutôt que de la recopier dans un état :
 * pas d'effet, pas de rendu en double, et le rendu serveur reste stable.
 */
function subscribeToTheme(onChange: () => void) {
  // La classe peut changer depuis ce bouton comme depuis un autre onglet.
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getTheme = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/** Le clair est le thème par défaut, côté serveur comme au premier rendu. */
const getServerTheme = () => "light" as const;

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  const toggle = useCallback(() => {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");

    // Garde la barre d'adresse mobile en accord avec la page.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[next]);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* mode privé : on se contente de la session en cours */
    }
  }, []);

  const label = theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-full border border-current/25",
        "transition-colors duration-200 hover:bg-current/10",
        className,
      )}
    >
      {/* Les deux icônes sont montées et permutées en CSS : rendu serveur stable. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-[18px] dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="hidden size-[18px] dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a6.8 6.8 0 0 0 10.3 10.3Z" />
      </svg>
    </button>
  );
}
