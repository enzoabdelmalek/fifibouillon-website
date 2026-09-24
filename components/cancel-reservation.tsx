"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Annulation par le client.
 *
 * Deux étapes volontairement : annuler une table est irréversible du point de
 * vue du visiteur - s'il change d'avis, le créneau peut avoir été repris.
 * Un bouton unique se clique par erreur, surtout sur un téléphone.
 */
export function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/reservations/${id}/annuler`, { method: "POST" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "L’annulation n’a pas pu aboutir. Merci de nous appeler.");
        return;
      }
      // La page est rendue à la demande : on la recharge pour afficher l'état.
      router.refresh();
    } catch {
      setError("Connexion interrompue. Vérifiez votre réseau et réessayez.");
    } finally {
      setPending(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-5 w-full rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
      >
        Annuler ma réservation
      </button>
    );
  }

  return (
    <div className="mt-5">
      <p className="text-sm/relaxed text-ink">
        Confirmer l’annulation ? La table sera remise à disposition.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="flex-1 rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Annulation…" : "Oui, annuler"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="flex-1 rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
        >
          Garder ma table
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm/relaxed text-brand-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
