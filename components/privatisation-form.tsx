"use client";

import { useId, useState } from "react";
import { Diamond } from "@/components/menu";
import {
  EVENT_LABELS,
  EVENT_TYPES,
  MAX_GUESTS,
  MIN_GUESTS,
  validatePrivatisation,
  type EventType,
} from "@/lib/privatisation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Form = {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  eventType: EventType;
  message: string;
};

const EMPTY: Form = {
  name: "",
  email: "",
  phone: "",
  date: "",
  guests: 20,
  eventType: "anniversaire",
  message: "",
};

export function PrivatisationForm() {
  const id = useId();
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ emailSent: boolean } | null>(null);

  const field = (name: keyof Form) => `${id}-${name}`;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const local = validatePrivatisation({ ...form, date: form.date || undefined });
    if (local) {
      setError(local);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/privatisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: form.date || undefined,
          message: form.message || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue. Merci de réessayer.");
        setSubmitting(false);
        return;
      }

      setDone({ emailSent: Boolean(data.emailSent) });
      setForm(EMPTY);
      setSubmitting(false);
    } catch {
      setError("Connexion interrompue. Vérifiez votre réseau et réessayez.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-sm border border-line bg-surface p-9 text-center shadow-card sm:p-12">
        <h2 className="font-display text-3xl text-ink">Votre demande est partie</h2>
        <div aria-hidden className="rule-ornament mx-auto mt-6 max-w-[14rem]">
          <Diamond />
        </div>
        <p className="mx-auto mt-6 max-w-sm text-base/relaxed text-muted">
          {done.emailSent
            ? "Nous vous rappelons rapidement pour caler les détails."
            : "Votre demande est bien enregistrée. L’accusé de réception n’a pas pu partir, mais nous l’avons reçue."}
        </p>
        <p className="mt-4 text-sm/relaxed text-muted">
          Une question d’ici là ?{" "}
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="font-medium text-brand-accent underline underline-offset-4"
          >
            {site.contact.phoneDisplay}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-sm border border-line bg-surface p-7 shadow-card sm:p-10"
    >
      <h2 className="font-display text-2xl text-ink sm:text-3xl">Votre demande</h2>
      <p className="mt-3 text-sm/relaxed text-muted">
        À partir de {MIN_GUESTS} personnes. Nous vous rappelons pour caler les détails.
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
            className={inputClass}
          />
        </Field>

        <Field label="Téléphone" htmlFor={field("phone")} required hint="Nous vous rappelons">
          <input
            id={field("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
            className={inputClass}
          />
        </Field>

        <Field
          label="Date souhaitée"
          htmlFor={field("date")}
          hint="Facultatif, si elle n’est pas arrêtée"
        >
          <input
            id={field("date")}
            name="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Personnes" htmlFor={field("guests")} required>
          <input
            id={field("guests")}
            name="guests"
            type="number"
            inputMode="numeric"
            min={MIN_GUESTS}
            max={MAX_GUESTS}
            required
            value={form.guests}
            onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))}
            className={inputClass}
          />
        </Field>

        <Field label="Type d’événement" htmlFor={field("eventType")} required>
          <select
            id={field("eventType")}
            name="eventType"
            required
            value={form.eventType}
            onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value as EventType }))}
            className={inputClass}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <Field
          label="Votre projet"
          htmlFor={field("message")}
          hint="Horaires, repas ou cocktail, contraintes…"
        >
          <textarea
            id={field("message")}
            name="message"
            rows={4}
            maxLength={1000}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Optionnel"
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-sm/relaxed text-brand-accent">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-primary px-7 py-4 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>

      <p className="mt-4 text-center text-xs/relaxed text-muted">
        Vos coordonnées servent uniquement à traiter cette demande.{" "}
        <a
          href="/confidentialite"
          className="text-brand-accent underline underline-offset-4 decoration-1 hover:decoration-2"
        >
          En savoir plus
        </a>
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-sm border border-line-strong bg-paper px-4 py-3 text-base text-ink transition-colors placeholder:text-muted/60 focus:border-primary " +
  "focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-accent";

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow text-muted">
        {label}
        {required ? <span aria-hidden className="text-brand-accent"> *</span> : null}
      </label>
      <div className="mt-2.5">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
