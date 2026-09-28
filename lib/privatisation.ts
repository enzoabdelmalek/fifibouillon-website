import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Demande de privatisation                                           */
/* ------------------------------------------------------------------ */

/**
 * Une privatisation n'est pas une réservation : elle ne bloque pas un
 * créneau, elle ouvre une discussion. Elle est donc enregistrée comme une
 * demande de devis, dans la table `quotes` — c'est exactement ce qu'elle
 * est, et le restaurant les retrouve dans l'écran « Devis » du dashboard.
 */

export const EVENT_TYPES = [
  "anniversaire",
  "repas d entreprise",
  "apres travail",
  "cocktail",
  "repas de famille",
  "autre",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_LABELS: Record<EventType, string> = {
  anniversaire: "Anniversaire",
  "repas d entreprise": "Repas d'entreprise",
  "apres travail": "Après-travail",
  cocktail: "Cocktail",
  "repas de famille": "Repas de famille",
  autre: "Autre",
};

/** En dessous, une table suffit : inutile de privatiser. */
export const MIN_GUESTS = 10;

/**
 * Au-delà, la salle ne suit pas. Calé sur la capacité annoncée : accepter
 * une demande qu'on ne peut pas honorer coûte plus cher que la refuser
 * tout de suite.
 */
export const MAX_GUESTS = site.privatisation.capacity;

export type PrivatisationInput = {
  name: string;
  email: string;
  phone: string;
  /** Date souhaitée. Facultative : beaucoup de demandes arrivent sans date arrêtée. */
  date?: string;
  guests: number;
  eventType: EventType;
  message?: string;
};

export function validatePrivatisation(input: Partial<PrivatisationInput>): string | null {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";

  if (name.length < 2) return "Merci d’indiquer votre nom.";
  if (name.length > 120) return "Ce nom est trop long.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Cette adresse e-mail semble incorrecte.";
  if (email.length > 160) return "Cette adresse e-mail est trop longue.";

  // Le téléphone est obligatoire ici, contrairement à une réservation : une
  // privatisation se cale de vive voix, pas par échange d'e-mails.
  if (phone.replace(/[^\d]/g, "").length < 9) return "Ce numéro de téléphone semble incomplet.";
  if (phone.length > 30) return "Ce numéro de téléphone semble incorrect.";

  const guests = Number(input.guests);
  if (!Number.isInteger(guests) || guests < MIN_GUESTS)
    return `Une privatisation commence à ${MIN_GUESTS} personnes. En dessous, réservez simplement une table.`;
  if (guests > MAX_GUESTS)
    return `Au-delà de ${MAX_GUESTS} personnes, appelez-nous au ${site.contact.phoneDisplay} : nous verrons ensemble ce qui est possible.`;

  if (!input.eventType || !EVENT_TYPES.includes(input.eventType))
    return "Merci de préciser le type d’événement.";

  // La date est facultative, mais si elle est donnée elle doit tenir debout.
  if (input.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return "Cette date est invalide.";
    if (input.date < new Date().toISOString().slice(0, 10)) return "Cette date est déjà passée.";
  }

  if ((input.message?.length ?? 0) > 1000) return "Votre message est trop long (1000 caractères max).";

  return null;
}

/**
 * Le récapitulatif enregistré dans `quotes.message`.
 *
 * Composé côté serveur, comme pour les réservations : c'est la seule version
 * écrite en base. Le formulaire ne fait que collecter.
 */
export function composeRequest(input: PrivatisationInput): string {
  const lignes = [
    `Privatisation - ${EVENT_LABELS[input.eventType]}`,
    `${input.guests} personnes`,
    input.date ? `Date souhaitée : ${formatDate(input.date)}` : "Date non arrêtée",
  ];
  const libre = input.message?.trim();
  if (libre) lignes.push("", libre);
  return lignes.join("\n");
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
