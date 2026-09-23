"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Diamond } from "@/components/menu";
import {
  MAX_GUESTS_ONLINE,
  groupSlots,
  lastBookableDate,
  todayInParis,
  validateReservation,
} from "@/lib/reservation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Slot = { time: string; seatsLeft: number; past: boolean };
type Availability = { closed: boolean; slots: Slot[]; degraded?: boolean };

const EMPTY: Form = { name: "", phone: "", email: "", date: "", time: "", guests: 2, message: "" };
type Form = {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  message: string;
};

export function ReservationForm() {
  const id = useId();
  const [form, setForm] = useState<Form>(EMPTY);
  // La disponibilité est mémorisée AVEC sa date : on en déduit si elle
  // correspond encore à la date choisie, plutôt que de la remettre à zéro
  // dans un effet (ce qui provoquerait un rendu en cascade).
  const [availability, setAvailability] = useState<{ date: string; data: Availability } | null>(
    null,
  );
  const [failedDate, setFailedDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const current = availability?.date === form.date ? availability.data : null;
  const loadingSlots = Boolean(form.date) && !current && failedDate !== form.date;

  const field = useCallback((name: keyof Form) => `${id}-${name}`, [id]);

  // Les créneaux dépendent du jour : on les recharge à chaque changement de date.
  useEffect(() => {
    const date = form.date;
    if (!date) return;

    const controller = new AbortController();
    fetch(`/api/reservations/availability?date=${date}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("indisponible"))))
      .then((data: Availability) => setAvailability({ date, data }))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setFailedDate(date);
      });

    return () => controller.abort();
  }, [form.date]);

  const slots = current?.slots ?? [];

  // Un créneau retenu qui n'est plus proposé au jour choisi doit être oublié.
  // Ajusté pendant le rendu : React relance le rendu aussitôt, sans passe
  // d'affichage intermédiaire montrant un horaire devenu invalide.
  const timeStillOffered =
    !form.time ||
    slots.length === 0 ||
    slots.some((s) => s.time === form.time && !s.past && s.seatsLeft > 0);
  if (!timeStillOffered) setForm((f) => ({ ...f, time: "" }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const local = validateReservation(form);
    if (local) {
      setError(local);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, message: form.message || undefined }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue. Merci de réessayer.");
        if (response.status === 409) setForm((f) => ({ ...f, time: "" }));
        return;
      }

      setDone({ emailSent: Boolean(data.emailSent) });
      setForm(EMPTY);
    } catch {
      setError("Connexion interrompue. Vérifiez votre réseau et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  // Le récapitulatif remplace le formulaire : on amène le focus dessus.
  useEffect(() => {
    if (done) confirmationRef.current?.focus();
  }, [done]);

  if (done) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="rounded-sm border border-line bg-surface p-9 text-center shadow-card sm:p-12"
      >
        <span
          aria-hidden
          className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-on-primary"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>

        <h2 className="mt-7 font-display text-3xl text-ink">Votre table est réservée</h2>
        <div aria-hidden className="rule-ornament mx-auto mt-6 max-w-[14rem]">
          <Diamond />
        </div>
        <p className="mx-auto mt-6 max-w-sm text-base/relaxed text-muted">
          {done.emailSent
            ? "Un e-mail de confirmation vient de vous être envoyé. Au plaisir de vous accueillir."
            : "Votre réservation est bien enregistrée. L’e-mail de confirmation n’a pas pu partir, mais la table est retenue."}
        </p>
        <p className="mt-4 text-sm/relaxed text-muted">
          Un empêchement ? Appelez-nous au{" "}
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="font-medium text-brand-accent underline underline-offset-4"
          >
            {site.contact.phoneDisplay}
          </a>
          .
        </p>

        <button
          type="button"
          onClick={() => setDone(null)}
          className="mt-9 rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
        >
          Réserver une autre table
        </button>
      </div>
    );
  }

  const groups = groupSlots(slots.map((s) => s.time));
  const slotByTime = new Map(slots.map((s) => [s.time, s]));

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-sm border border-line bg-surface p-7 shadow-card sm:p-10"
    >
      <h2 className="font-display text-2xl text-ink sm:text-3xl">Réserver une table</h2>
      <p className="mt-3 text-sm/relaxed text-muted">
        Jusqu’à {MAX_GUESTS_ONLINE} convives en ligne. Au-delà, appelez-nous : on
        organise la table avec vous.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Nom" htmlFor={field("name")} required>
          <input
            id={field("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Votre nom"
            className={inputClass}
          />
        </Field>

        <Field label="Convives" htmlFor={field("guests")} required>
          <select
            id={field("guests")}
            name="guests"
            required
            value={form.guests}
            onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))}
            className={inputClass}
          >
            {Array.from({ length: MAX_GUESTS_ONLINE }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n > 1 ? "personnes" : "personne"}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Téléphone" htmlFor={field("phone")} required>
          <input
            id={field("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="06 12 34 56 78"
            className={inputClass}
          />
        </Field>

        <Field label="E-mail" htmlFor={field("email")} required>
          <input
            id={field("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="vous@exemple.fr"
            className={inputClass}
          />
        </Field>

        <Field label="Date" htmlFor={field("date")} required className="sm:col-span-2">
          <input
            id={field("date")}
            name="date"
            type="date"
            required
            min={todayInParis()}
            max={lastBookableDate()}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Créneaux */}
      <div className="mt-8">
        <p className="eyebrow text-muted">
          Horaire <span className="text-brand-accent">*</span>
        </p>

        {!form.date ? (
          <p className="mt-4 text-sm text-muted italic">
            Choisissez d’abord une date pour voir les créneaux disponibles.
          </p>
        ) : loadingSlots ? (
          <p className="mt-4 text-sm text-muted italic">Recherche des disponibilités…</p>
        ) : current?.closed ? (
          <p className="mt-4 text-sm text-muted italic">
            Nous sommes fermés ce jour-là. Choisissez une autre date.
          </p>
        ) : slots.length === 0 ? (
          <p className="mt-4 text-sm text-muted italic">
            Impossible de charger les créneaux. Appelez-nous au {site.contact.phoneDisplay}.
          </p>
        ) : (
          <div className="mt-5 space-y-6">
            {groups.map((group) => (
              <fieldset key={group.label}>
                <legend className="eyebrow mb-3 text-brand-accent">{group.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {group.slots.map((time) => {
                    const slot = slotByTime.get(time)!;
                    const disabled = slot.past || slot.seatsLeft <= 0;
                    const selected = form.time === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={disabled}
                        aria-pressed={selected}
                        title={
                          slot.past
                            ? "Créneau déjà passé"
                            : slot.seatsLeft <= 0
                              ? "Complet"
                              : undefined
                        }
                        onClick={() => setForm((f) => ({ ...f, time }))}
                        className={cn(
                          "min-w-[4.5rem] rounded-full border px-4 py-2.5 text-sm tabular-nums transition-colors duration-200",
                          selected
                            ? "border-primary bg-primary text-on-primary"
                            : disabled
                              ? "cursor-not-allowed border-line text-muted/45 line-through"
                              : "border-line-strong text-ink hover:bg-paper-alt",
                        )}
                      >
                        {time.replace(":", "h")}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Field label="Message" htmlFor={field("message")} hint="Allergies, poussette, occasion…">
          <textarea
            id={field("message")}
            name="message"
            rows={3}
            maxLength={500}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Optionnel"
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-7 rounded-sm border border-primary/40 bg-primary/5 px-4 py-3 text-sm/relaxed text-ink"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-primary px-7 py-4 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Envoi en cours…" : "Confirmer la réservation"}
      </button>

      <p className="mt-4 text-center text-xs/relaxed text-muted">
        Vos coordonnées servent uniquement à gérer cette réservation.{" "}
        <a
          href="/confidentialite"
          className="text-brand-accent underline-offset-4 hover:underline"
        >
          En savoir plus
        </a>
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-sm border border-line-strong bg-paper px-4 py-3 text-base text-ink transition-colors placeholder:text-muted/60 focus:border-primary focus:outline-none";

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="eyebrow block text-muted">
        {label} {required ? <span className="text-brand-accent">*</span> : null}
      </label>
      <div className="mt-2.5">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
