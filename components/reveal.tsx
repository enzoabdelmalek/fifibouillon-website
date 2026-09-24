"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Retard d'apparition en ms - sert à cascader plusieurs blocs. */
  delay?: number;
  /**
   * Pour les blocs visibles sans défiler. Une animation CSS pure prend le
   * relais : rien n'attend l'hydratation, donc rien ne retarde le LCP.
   */
  immediate?: boolean;
  as?: ElementType;
  className?: string;
};

/** Fait apparaître son contenu en fondu/translation dès qu'il entre dans le viewport. */
export function Reveal({ children, delay = 0, as: Tag = "div", className, immediate = false }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref}
      className={cn(immediate ? "reveal-now" : "reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
