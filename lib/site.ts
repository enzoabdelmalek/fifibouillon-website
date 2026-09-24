/**
 * Informations pratiques du restaurant.
 *
 * ⚠️ SOURCE DE VÉRITÉ pour le site, jusqu'à la migration v2.
 *
 * Les mêmes horaires existent aussi dans `businesses.hours` en base, où le
 * dashboard les lit. Tant que FiFi n'a pas de compte dashboard, personne ne
 * peut les y modifier et les deux ne peuvent pas diverger. **Le jour où tu
 * crées un accès client, il faut brancher le site sur la base** - sinon le
 * client changera ses horaires dans le dashboard, le site gardera les
 * anciens, et continuera de proposer des créneaux sur un service fermé.
 *
 * Toutes les valeurs sont celles du client, validées avec lui. Elles
 * alimentent l'en-tête, le pied de page, la page « Nous trouver » et les
 * données structurées Schema.org (SEO / Google) - et, pour les horaires,
 * les créneaux de réservation. Une seule source de vérité : modifier une
 * valeur ici la corrige partout.
 */

export const site = {
  name: "FiFi",
  fullName: "FiFi Bouillon & Brasserie",
  tagline: "Bouillon & Brasserie",
  district: "9ᵉ arrondissement",
  city: "Paris",

  description:
    "Bouillon & brasserie dans le 9ᵉ arrondissement de Paris. La cuisine française de toujours, généreuse et à prix juste, servie dans une salle chaleureuse du matin au soir.",

  /** URL de production - sert aux métadonnées Open Graph et au sitemap. */
  url: "https://www.fifibouillon.com",

  contact: {
    phone: "+33 9 51 28 34 18",
    phoneDisplay: "09 51 28 34 18",
    email: "fifirestaurantparis@gmail.com",
  },

  address: {
    street: "56B rue de Clichy",
    postalCode: "75009",
    city: "Paris",
    country: "FR",
    /** Coordonnées du siège déclaré en base Sirene, au mètre près. */
    latitude: 48.880853,
    longitude: 2.328765,
  },

  /**
   * Lien « Itinéraire ». Cherche l'adresse dans Google Maps ; si la fiche
   * Google Business du restaurant existe, remplace-le par son lien direct
   * (partage → copier le lien), la fiche s'ouvrira alors directement.
   */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=56B+rue+de+Clichy%2C+75009+Paris",

  transport: [
    // Liège est la station la plus proche : environ 185 m, soit 2 à 3 minutes
    // à pied. Place de Clichy est un peu plus loin mais dessert deux lignes.
    { label: "Métro", value: "Liège (13) à 3 min · Place de Clichy (2, 13)" },
  ],

  social: {
    instagram: "https://www.instagram.com/fifibouillonparis",
    tiktok: "https://www.tiktok.com/@fifibouillon",
    facebook: "", // laisser vide pour masquer le lien
  },

  /**
   * Horaires de service - ouvert 7j/7, en service continu.
   *
   * `days` / `value` sont affichés tels quels sur le site ; `schema` alimente
   * le OpeningHoursSpecification de Schema.org, que Google utilise pour
   * afficher « Ouvert » / « Fermé » dans les résultats de recherche.
   * Les deux doivent rester cohérents.
   *
   * Une fermeture antérieure à l'ouverture (00:00 ou 02:00 contre 11:00) se
   * lit comme le lendemain : c'est la convention de Schema.org, et
   * `slotsForDate` applique la même règle pour les créneaux de réservation.
   */
  hours: [
    {
      days: "Dimanche – Jeudi",
      value: "11h00 – 00h00",
      schema: {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "11:00",
        closes: "00:00",
      },
    },
    {
      days: "Vendredi – Samedi",
      value: "11h00 – 02h00",
      schema: { days: ["Friday", "Saturday"], opens: "11:00", closes: "02:00" },
    },
  ],

  /**
   * Identité légale de l'éditeur - mentions légales (LCEN art. 6 III).
   *
   * Complet et vérifié. Ne modifier qu'à partir d'une source officielle : un
   * site professionnel dont les mentions légales sont fausses ou absentes
   * expose son éditeur à une sanction, et c'est le client qui est
   * responsable, pas nous.
   */
  legal: {
    /**
     * L'enseigne est « FiFi », la société est « RESTO B 56 » : ce sont les
     * informations de la SOCIÉTÉ qui doivent figurer ici, pas celles de
     * l'enseigne. Source : SIREN 502155716, base Sirene / RNE, siège déclaré
     * au 56 B rue de Clichy - c'est bien le même établissement.
     */
    companyName: "RESTO B 56",
    legalForm: "SARL (société à responsabilité limitée)",
    capital: "2 000 €",
    siren: "502 155 716",
    rcs: "Paris",
    /** Calculé : clé = (12 + 3 × (SIREN mod 97)) mod 97 = 27. */
    vatNumber: "FR27502155716",
    publicationDirector: "Rachid Benneouala, gérant",
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
    /**
     * Durées de conservation annoncées dans la politique de confidentialité.
     *
     * ⚠️ Ce sont des ENGAGEMENTS : rien ne les applique aujourd'hui, aucune
     * purge n'est programmée. Une politique qui promet un effacement qui
     * n'arrive jamais est pire que pas de politique du tout - c'est une
     * déclaration inexacte à la CNIL en cas de contrôle. À implémenter côté
     * base avant la mise en ligne, ou à revoir à la baisse ici.
     *
     * 13 mois pour l'audience : c'est le plafond que la CNIL tolère pour une
     * mesure d'audience dispensée de consentement.
     */
    retention: {
      reservationMonths: 12,
      analyticsMonths: 13,
    },

    /** Dernière mise à jour des textes légaux, affichée en bas de page. */
    updatedOn: "2026-09-23",
  },

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
  { href: "/reserver", label: "Réserver" },
] as const;

/**
 * Sur grand écran, « Réserver » est un bouton distinct dans l'en-tête : il ne
 * doit pas apparaître deux fois dans la barre de navigation.
 */
export const desktopNav = nav.filter((item) => item.href !== "/reserver");
