"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { desktopNav, nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Referme le menu à chaque navigation. On ajuste l'état pendant le rendu
  // (plutôt que dans un effet) : React ré-exécute le rendu immédiatement,
  // sans passe d'affichage intermédiaire avec le menu encore ouvert.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Bloque le défilement de la page derrière le menu plein écran.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Les pages ouvrent sur un bandeau jaune beurre : l'en-tête y flotte sans
     fond. Au défilement, il se pose sur du blanc. Le texte reste marron dans
     les deux cas — plus de bascule de couleur à gérer. */
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-ink transition-[background-color,border-color,box-shadow] duration-300",
        solid
          ? "border-b border-line bg-paper/92 shadow-[0_1px_24px_-12px_rgb(45_18_13/0.4)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* Pleine largeur : l'en-tête va d'un bord à l'autre, sans la gouttière
          d'un conteneur centré. Seule la marge de sécurité subsiste. */}
      <div className="flex h-[72px] w-full items-center gap-6 px-5 sm:px-8 lg:h-20 lg:px-10">
        <Link
          href="/"
          aria-label="FiFi — retour à l'accueil"
          className="flex shrink-0 items-center gap-3.5 transition-opacity hover:opacity-80"
        >
          <Wordmark className="h-7 sm:h-8" priority />
          <span aria-hidden className="hidden h-8 w-px bg-current/25 sm:block" />
          <span aria-hidden className="hidden leading-[1.5] sm:block">
            <span className="eyebrow block text-[0.6rem] opacity-80">Bouillon &amp; Brasserie</span>
            <span className="eyebrow block text-[0.6rem] text-brand-accent">9ᵉ arr.</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden flex-1 lg:block">
          <ul className="flex items-center justify-center gap-2 xl:gap-5">
            {desktopNav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block px-3.5 py-2 text-[0.8rem] tracking-[0.16em] uppercase transition-opacity",
                      active ? "opacity-100" : "opacity-70 hover:opacity-100",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-primary transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pas de téléphone ici : « Réserver » est l'action de l'en-tête, et
            le numéro reste accessible dans le menu mobile et en pied de page,
            où on va le chercher. */}
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <Link
            href="/reserver"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.8rem] tracking-[0.12em] whitespace-nowrap text-on-primary uppercase transition-colors hover:bg-primary-hover sm:px-6"
          >
            Réserver
          </Link>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="grid size-10 place-items-center rounded-full border border-current/25 transition-colors hover:bg-current/10 lg:hidden"
          >
            {open ? <CloseIcon className="size-4" /> : <BurgerIcon className="size-4" />}
          </button>
        </div>
      </div>

      {/* Menu plein écran (mobile / tablette) */}
      <div
        id="menu-mobile"
        hidden={!open}
        className="h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-paper text-ink lg:hidden"
      >
        <nav aria-label="Navigation principale" className="px-5 py-6 sm:px-8">
          <ul className="flex flex-col">
            {nav.map((item, index) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    className="flex items-baseline gap-4 py-4 font-display text-3xl"
                  >
                    <span className="eyebrow w-6 shrink-0 text-brand-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={cn(active && "text-brand-accent")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 space-y-3 text-sm text-muted">
            <a
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-ink"
            >
              <PhoneIcon className="size-4 text-brand-accent" />
              {site.contact.phoneDisplay}
            </a>
            <p className="flex items-start gap-3">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-brand-accent" />
              <span>
                {site.happyHour.label} — {site.happyHour.value}
              </span>
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.2 3.5h3l1.5 3.7-1.9 1.4a12.5 12.5 0 0 0 5.6 5.6l1.4-1.9 3.7 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3 1.8" />
    </svg>
  );
}

function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}
