/**
 * Informations pratiques du restaurant.
 *
 * ⚠️ Les valeurs marquées « À COMPLÉTER » sont des espaces réservés :
 * remplace-les par les vraies coordonnées du client. Elles alimentent
 * l'en-tête, le pied de page, la page Contact et les données
 * structurées Schema.org (SEO / Google).
 */

export const site = {
  name: "FiFi",
  fullName: "FiFi — Bouillon & Brasserie",
  tagline: "Bouillon & Brasserie",
  district: "9ᵉ arrondissement",
  city: "Paris",

  description:
    "Bouillon & brasserie dans le 9ᵉ arrondissement de Paris. La cuisine française de toujours, généreuse et à prix juste, servie dans une salle chaleureuse du matin au soir.",

  /** URL de production — sert aux métadonnées Open Graph et au sitemap. */
  url: "https://www.bouillonfifi.fr", // À COMPLÉTER

  contact: {
    phone: "+33 9 51 28 34 18",
    phoneDisplay: "09 51 28 34 18",
    email: "contact@bouillonfifi.fr", // À COMPLÉTER
  },

  address: {
    street: "56B rue de Clichy",
    postalCode: "75009",
    city: "Paris",
    country: "FR",
  },

  /**
   * Lien « Itinéraire ». Cherche l'adresse dans Google Maps ; si la fiche
   * Google Business du restaurant existe, remplace-le par son lien direct
   * (partage → copier le lien), la fiche s'ouvrira alors directement.
   */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=56B+rue+de+Clichy%2C+75009+Paris",

  transport: [
    // ⚠️ À VÉRIFIER : stations plausibles pour le haut de la rue de Clichy,
    // mais je n'ai pas pu confirmer laquelle est la plus proche du 56B.
    { label: "Métro", value: "Liège (13) · Place de Clichy (2, 13)" },
  ],

  social: {
    instagram: "https://www.instagram.com/", // À COMPLÉTER
    facebook: "", // laisser vide pour masquer le lien
  },

  /**
   * Horaires de service. `hours` est affiché tel quel ;
   * `schema` suit le format OpeningHoursSpecification de Schema.org.
   */
  hours: [
    { days: "Lundi – Jeudi", value: "12h00 – 23h00" }, // À COMPLÉTER
    { days: "Vendredi – Samedi", value: "12h00 – 00h00" }, // À COMPLÉTER
    { days: "Dimanche", value: "12h00 – 22h30" }, // À COMPLÉTER
  ],

  happyHour: {
    label: "Happy hour",
    value: "Tous les jours, 16h – 22h",
  },

  /** Service continu : argument fort d'un bouillon, affiché en accroche. */
  highlights: [
    "Service continu",
    "Cuisine maison",
    "Happy hour 16h – 22h",
  ],
} as const;

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/la-carte", label: "La carte" },
  { href: "/les-boissons", label: "Les boissons" },
  { href: "/la-maison", label: "La maison" },
  { href: "/nous-trouver", label: "Nous trouver" },
] as const;
