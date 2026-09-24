import Image from "next/image";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ALT = `${site.fullName}, ${site.district}`;

/**
 * Logo FiFi, blason vertical complet (chat + FIFI + « Bouillon & Brasserie »).
 * Les deux fichiers sont détourés : `logo-light.png` est calibré pour les
 * fonds clairs, `logo-dark.png` pour les fonds sombres.
 *
 * - `variant="auto"`  : suit le thème clair/sombre du site.
 * - `variant="onDark"`: force la version claire, pour les bandeaux bordeaux.
 */
export function Logo({
  className,
  variant = "auto",
  priority = false,
}: {
  className?: string;
  variant?: "auto" | "onDark";
  priority?: boolean;
}) {
  if (variant === "onDark") {
    return (
      <Image
        src="/assets/logo-dark.png"
        alt={ALT}
        width={480}
        height={744}
        sizes="180px"
        preload={priority}
        className={cn("w-auto", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/assets/logo-light.png"
        alt={ALT}
        width={576}
        height={784}
        sizes="180px"
        preload={priority}
        className={cn("w-auto dark:hidden", className)}
      />
      <Image
        src="/assets/logo-dark.png"
        alt=""
        aria-hidden
        width={480}
        height={744}
        sizes="180px"
        loading="lazy"
        className={cn("hidden w-auto dark:block", className)}
      />
    </>
  );
}

/**
 * Le lettrage « FiFi » seul. Le blason vertical devient illisible en dessous
 * de ~80 px de haut : c'est cette version qu'on utilise dans l'en-tête.
 */
export function Wordmark({
  className,
  variant = "auto",
  priority = false,
}: {
  className?: string;
  variant?: "auto" | "onDark";
  priority?: boolean;
}) {
  if (variant === "onDark") {
    return (
      <Image
        src="/assets/wordmark-dark.png"
        alt={ALT}
        width={464}
        height={278}
        sizes="72px"
        preload={priority}
        className={cn("w-auto", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/assets/wordmark-light.png"
        alt={ALT}
        width={551}
        height={307}
        sizes="72px"
        preload={priority}
        className={cn("w-auto dark:hidden", className)}
      />
      <Image
        src="/assets/wordmark-dark.png"
        alt=""
        aria-hidden
        width={464}
        height={278}
        sizes="72px"
        loading="lazy"
        className={cn("hidden w-auto dark:block", className)}
      />
    </>
  );
}

/** Le chat du logo, seul - utilisé comme ornement. */
export function CatMark({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/cat.png"
      alt=""
      aria-hidden
      width={126}
      height={208}
      sizes="200px"
      loading="lazy"
      className={cn("w-auto", className)}
    />
  );
}
