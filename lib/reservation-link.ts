import "server-only";
import { firstNameOf, isUuid, linkState } from "@/lib/reservation";
import { getSupabase } from "@/lib/supabase";

/**
 * Consultation et annulation d'une réservation par son lien.
 *
 * L'identifiant est un UUID v4 : 122 bits d'entropie, il n'est pas devinable
 * et tient donc lieu de preuve que le porteur du lien est bien celui qui a
 * réservé. Mais un lien circule - historique d'un téléphone partagé, capture
 * d'écran, message transféré. Deux garde-fous en découlent :
 *
 * 1. **Le lien expire.** Après le service, il n'a plus aucune raison d'exister
 *    et ne sert plus qu'à exposer des données. On le coupe.
 * 2. **La page ne montre que l'essentiel** : prénom, date, heure, convives.
 *    Ni téléphone ni e-mail - le client les connaît déjà, les afficher
 *    n'apporte rien et aggrave ce qu'une fuite révélerait.
 *
 * Et un lien expiré répond EXACTEMENT comme un lien inventé. Sans ça,
 * l'adresse devient un oracle : on teste des identifiants, et la différence
 * de réponse dit lesquels existent.
 */


/** On n'annule plus une fois l'heure passée : la table est déjà dressée. */
export type Reservation = {
  id: string;
  firstName: string;
  date: string;
  guests: number;
  cancelled: boolean;
  /** Peut encore être annulée par le client. */
  cancellable: boolean;
};




/**
 * Renvoie la réservation, ou `null` si le lien est inconnu, expiré, ou
 * si l'identifiant n'est pas un UUID. Un seul `null` pour tous les cas :
 * l'appelant ne peut pas les distinguer, le visiteur non plus.
 */
export async function findByLink(id: string): Promise<Reservation | null> {
  if (!isUuid(id)) return null;

  const supabase = getSupabase();
  if (!supabase.configured) return null;

  const { data, error } = await supabase.client
    .from("reservations")
    .select("id, customer_name, date, guests, status")
    .eq("id", id)
    .eq("business_id", supabase.businessId)
    .maybeSingle();

  if (error || !data) return null;

  const state = linkState(data.date, data.status);
  if (state.expired) return null;

  return {
    id: data.id,
    firstName: firstNameOf(data.customer_name),
    date: data.date,
    guests: data.guests ?? 1,
    cancelled: state.cancelled,
    cancellable: state.cancellable,
  };
}

/**
 * Annule la réservation. Ne supprime pas la ligne : le restaurant doit
 * pouvoir constater l'annulation, et une table libérée n'est pas une table
 * qui n'a jamais existé.
 */
export async function cancelByLink(id: string): Promise<boolean> {
  const reservation = await findByLink(id);
  if (!reservation?.cancellable) return false;

  const supabase = getSupabase();
  if (!supabase.configured) return false;

  const { error } = await supabase.client
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("business_id", supabase.businessId);

  if (error) {
    console.error("[reservation-link] annulation :", error.message);
    return false;
  }

  return true;
}
