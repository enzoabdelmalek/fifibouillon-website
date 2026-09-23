/**
 * Emplacements photo du site.
 *
 * Le site est livré sans photographie : le client doit les fournir. Plutôt
 * que de laisser des trous dans les pages, chaque emplacement est déclaré ici
 * avec ses proportions et son texte alternatif. Tant que `file` vaut `null`,
 * le composant `<Photo>` affiche un panneau ornemental — le site reste fini.
 *
 * Pour livrer une photo : déposer le fichier dans `public/photos/`, puis
 * renseigner `file` et `width`/`height` (les dimensions réelles du fichier,
 * elles réservent la place et évitent que la page saute au chargement).
 *
 * Le texte alternatif n'est pas facultatif : il est lu par les lecteurs
 * d'écran et indexé par Google. Il décrit ce qu'on voit, pas ce qu'on vend —
 * « salle voûtée aux banquettes rouges », pas « notre superbe restaurant ».
 */
export type PhotoSlot = {
  /** Fichier dans `public/photos/`, ou `null` tant qu'il n'est pas fourni. */
  file: string | null;
  /** Dimensions réelles du fichier, en pixels. */
  width?: number;
  height?: number;
  /** Ce qu'on voit sur l'image. Obligatoire. */
  alt: string;
  /** Proportions de l'emplacement, respectées même sans photo. */
  ratio: "3/4" | "4/3" | "1/1" | "16/9" | "3/2";
  /** Ce qu'il faut demander au client — affiché en développement seulement. */
  brief: string;
};

export const photos = {
  salle: {
    file: null,
    alt: "La salle du bouillon FiFi, ses tables dressées et son comptoir",
    ratio: "4/3",
    brief: "La salle en service, plutôt le soir, lumière chaude, des clients attablés",
  },
  facade: {
    file: null,
    alt: "La devanture de FiFi, 56B rue de Clichy",
    ratio: "3/2",
    brief: "La devanture depuis le trottoir d'en face, enseigne lisible, de jour",
  },
  assiette: {
    file: null,
    alt: "Un plat du jour servi chez FiFi",
    ratio: "1/1",
    brief: "Un plat signature vu de dessus, sur la nappe, sans styling excessif",
  },
  comptoir: {
    file: null,
    alt: "Le comptoir de FiFi et sa sélection de vins au verre",
    ratio: "3/4",
    brief: "Le comptoir à l'heure de l'apéritif, verticale",
  },
} as const satisfies Record<string, PhotoSlot>;

export type PhotoName = keyof typeof photos;

/** Emplacements encore vides — sert au récapitulatif à demander au client. */
export function missingPhotos(): PhotoName[] {
  return (Object.keys(photos) as PhotoName[]).filter((name) => !photos[name].file);
}
