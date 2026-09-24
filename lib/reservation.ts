import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Règles de réservation                                              */
/* ------------------------------------------------------------------ */

/** Pas entre deux créneaux proposés, en minutes. */
export const SLOT_STEP_MINUTES = 30;

/** Dernier service : on cesse de proposer des créneaux N minutes avant la fermeture. */
export const LAST_SEATING_BEFORE_CLOSE_MINUTES = 60;

/** Au-delà, on invite à appeler : un groupe se cale au téléphone. */
export const MAX_GUESTS_ONLINE = 10;

/** Couverts réservables en ligne sur un même créneau. */
export const MAX_COVERS_PER_SLOT = 24;

/** Combien de jours à l'avance on accepte les réservations. */
export const BOOKING_HORIZON_DAYS = 60;

export const TIME_ZONE = "Europe/Paris";

/* ------------------------------------------------------------------ */
/*  Dates et fuseau                                                    */
/* ------------------------------------------------------------------ */

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Décalage d'Europe/Paris par rapport à UTC, à un instant donné (ms). */
function parisOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));

  const v = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const hour = v("hour") === 24 ? 0 : v("hour");
  return Date.UTC(v("year"), v("month") - 1, v("day"), hour, v("minute"), v("second")) - utcMs;
}

/**
 * Convertit une date + une heure locales parisiennes en instant UTC.
 *
 * Indispensable : le site est à Paris, mais le serveur qui enregistre la
 * réservation peut tourner en UTC. Sans cette conversion, une table réservée
 * à 20h apparaîtrait à 18h ou 22h dans le dashboard selon la saison.
 * Deux passes pour absorber les bascules heure d'été / heure d'hiver.
 */
export function parisDateTimeToUtc(isoDate: string, time: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);

  let utc = naive - parisOffsetMs(naive);
  utc = naive - parisOffsetMs(utc);
  return new Date(utc);
}

/** Date du jour à Paris, au format YYYY-MM-DD. */
export function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Dernière date réservable, au format YYYY-MM-DD. */
export function lastBookableDate(): string {
  const [y, m, d] = todayInParis().split("-").map(Number);
  const limit = new Date(Date.UTC(y, m - 1, d + BOOKING_HORIZON_DAYS));
  return limit.toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return (
    probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d
  );
}

/* ------------------------------------------------------------------ */
/*  Créneaux                                                           */
/* ------------------------------------------------------------------ */

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Horaires applicables à une date, ou `null` si la salle est fermée ce jour-là. */
function openingFor(isoDate: string) {
  if (!isValidIsoDate(isoDate)) return null;
  const [y, m, d] = isoDate.split("-").map(Number);
  const dayName = DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return site.hours.find((h) => (h.schema.days as readonly string[]).includes(dayName)) ?? null;
}

/**
 * Instant réel d'un créneau, en UTC.
 *
 * Le vendredi, le service va jusqu'à 2h : « 01:00 » y désigne la nuit de
 * vendredi à **samedi**, pas le petit matin du vendredi. Un créneau antérieur
 * à l'ouverture appartient donc au lendemain - sans ce décalage, la table
 * serait réservée vingt-quatre heures trop tôt.
 */
export function slotToUtc(isoDate: string, time: string): Date {
  const opening = openingFor(isoDate);
  if (opening && toMinutes(time) < toMinutes(opening.schema.opens)) {
    const [y, m, d] = isoDate.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    return parisDateTimeToUtc(next.toISOString().slice(0, 10), time);
  }
  return parisDateTimeToUtc(isoDate, time);
}

/**
 * Créneaux proposés pour une date donnée.
 *
 * Ils sont dérivés des horaires d'ouverture de `lib/site.ts` : une seule
 * source de vérité. Corriger les horaires corrige aussi les créneaux - pas
 * de risque de proposer une table à une heure où la salle est fermée.
 */
export function slotsForDate(isoDate: string): string[] {
  const slot = openingFor(isoDate);
  if (!slot) return [];

  const opens = toMinutes(slot.schema.opens);
  let closes = toMinutes(slot.schema.closes);
  if (closes <= opens) closes += 24 * 60; // fermeture après minuit

  const last = closes - LAST_SEATING_BEFORE_CLOSE_MINUTES;
  const first = Math.ceil(opens / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;

  const out: string[] = [];
  for (let t = first; t <= last; t += SLOT_STEP_MINUTES) out.push(toTime(t));
  return out;
}

/**
 * Regroupe les créneaux en moments de la journée.
 * FiFi sert en continu : ce découpage est un confort de lecture, pas une
 * coupure de service - il ne doit jamais créer de trou entre deux groupes.
 */
export function groupSlots(slots: string[]) {
  const groups: { label: string; slots: string[] }[] = [
    { label: "Déjeuner", slots: [] },
    { label: "Après-midi", slots: [] },
    { label: "Dîner", slots: [] },
  ];

  for (const s of slots) {
    const mins = toMinutes(s);
    const afterMidnight = mins < 6 * 60;
    if (!afterMidnight && mins < 15 * 60) groups[0].slots.push(s);
    else if (!afterMidnight && mins < 18 * 60) groups[1].slots.push(s);
    else groups[2].slots.push(s);
  }

  return groups.filter((g) => g.slots.length > 0);
}

/** Créneaux déjà passés pour aujourd'hui - on ne propose pas une table pour 13h à 15h. */
export function isSlotInPast(isoDate: string, time: string): boolean {
  return slotToUtc(isoDate, time).getTime() <= Date.now();
}

/* ------------------------------------------------------------------ */
/*  Validation du formulaire (partagée client / serveur)               */
/* ------------------------------------------------------------------ */

export type ReservationInput = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
};

/**
 * Renvoie un message d'erreur, ou `null` si tout va bien.
 * Utilisée des deux côtés : le client pour un retour immédiat, le serveur
 * parce qu'une validation côté navigateur se contourne en trois clics.
 */
export function validateReservation(input: Partial<ReservationInput>): string | null {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  if (name.length < 2) return "Merci d’indiquer votre nom.";
  if (name.length > 120) return "Ce nom est trop long.";

  // Souple volontairement : indicatifs, espaces, points et tirets acceptés.
  if (phone.replace(/[^\d]/g, "").length < 9) return "Ce numéro de téléphone semble incomplet.";
  if (phone.length > 30) return "Ce numéro de téléphone semble incorrect.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Cette adresse e-mail semble incorrecte.";
  if (email.length > 160) return "Cette adresse e-mail est trop longue.";

  if (!input.date || !isValidIsoDate(input.date)) return "Merci de choisir une date.";
  if (input.date < todayInParis()) return "Cette date est déjà passée.";
  if (input.date > lastBookableDate())
    return `Nous prenons les réservations jusqu’à ${BOOKING_HORIZON_DAYS} jours à l’avance.`;

  const guests = Number(input.guests);
  if (!Number.isInteger(guests) || guests < 1) return "Merci d’indiquer le nombre de convives.";
  if (guests > MAX_GUESTS_ONLINE)
    return `Au-delà de ${MAX_GUESTS_ONLINE} convives, appelez-nous au ${site.contact.phoneDisplay} : nous organiserons la table avec vous.`;

  if (!input.time) return "Merci de choisir un horaire.";
  if (!slotsForDate(input.date).includes(input.time))
    return "Cet horaire n’est pas proposé ce jour-là.";
  if (isSlotInPast(input.date, input.time)) return "Cet horaire est déjà passé.";

  if ((input.message?.length ?? 0) > 500) return "Votre message est trop long (500 caractères max).";

  return null;
}

/* ------------------------------------------------------------------ */
/*  Lien de suivi d'une réservation                                    */
/* ------------------------------------------------------------------ */

/** Le lien reste valide pendant le service, puis se ferme. */
export const LINK_GRACE_HOURS = 3;

/**
 * État d'un lien à un instant donné.
 *
 * Fonction pure, sans base : c'est la règle, et c'est elle qu'on teste.
 * `now` est un paramètre pour que les tests n'aient pas à attendre trois
 * heures.
 */
export function linkState(
  dateIso: string,
  status: string,
  now: number = Date.now(),
): { expired: boolean; cancelled: boolean; cancellable: boolean } {
  const when = new Date(dateIso).getTime();
  const expired = now > when + LINK_GRACE_HOURS * 3_600_000;
  const cancelled = status === "cancelled";
  return { expired, cancelled, cancellable: !expired && !cancelled && now < when };
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Le prénom seul : « Marie » plutôt que « Marie Dupont ». */
export function firstNameOf(fullName: string | null): string {
  return (fullName ?? "").trim().split(/\s+/)[0] || "";
}
