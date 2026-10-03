import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retrouver la fiche d'un client, ou la créer.
 *
 * En v1, une réservation portait le nom et le téléphone en clair. La v2 a
 * une table `customers`, et c'est elle qui permet au restaurant de voir
 * qu'une personne en est à sa cinquième visite — ce que la v1 ne savait pas
 * dire.
 *
 * ─── LE RAPPROCHEMENT ────────────────────────────────────────────────────
 *
 * Par TÉLÉPHONE d'abord, par e-mail ensuite. C'est la même règle que la
 * migration (`regrouperClients`), et c'est volontaire : deux règles
 * différentes finiraient par fabriquer deux fiches pour la même personne,
 * l'une à l'import et l'autre à la réservation suivante.
 *
 * On NE regroupe PAS sur le nom. Deux « Martin » sans autre point commun
 * sont deux personnes ; un doublon se fusionne, une fusion abusive ne se
 * défait pas.
 */

/** Le téléphone réduit à ses chiffres, ou null s'il est trop court pour identifier. */
export function normaliserTel(telephone: string | null | undefined): string | null {
    const tel = (telephone ?? "").replace(/[^0-9+]/g, "");
    return tel.length >= 6 ? tel : null;
}

/** L'e-mail en minuscules, ou null. La base impose la minuscule. */
export function normaliserMail(email: string | null | undefined): string | null {
    const m = (email ?? "").trim().toLowerCase();
    return m || null;
}

type Identite = {
    nom: string;
    telephone?: string | null;
    email?: string | null;
    /** D'où vient la fiche. `customers.source` a une liste fermée de valeurs. */
    source?: "reservation" | "quote" | "form";
};

export async function retrouverOuCreerClient(
    sb: SupabaseClient,
    businessId: string,
    { nom, telephone, email, source = "reservation" }: Identite,
): Promise<{ id: string | null; erreur?: string }> {
    const tel = normaliserTel(telephone);
    const mail = normaliserMail(email);

    /*
     * Sans téléphone NI e-mail, on ne crée pas de fiche.
     *
     * `reservations.customer_id` accepte le vide, et `guest_name` porte
     * alors le nom. Fabriquer une fiche qu'aucune réservation suivante ne
     * pourra retrouver ne ferait qu'encombrer le fichier clients d'entrées
     * mortes.
     */
    if (!tel && !mail) return { id: null };

    const chercher = async () => {
        let q = sb.from("customers").select("id, full_name, phone, email").eq("business_id", businessId);
        // Une seule requête : on prend celui qui correspond par l'un OU l'autre.
        q = tel && mail ? q.or(`phone.eq.${tel},email.eq.${mail}`) : tel ? q.eq("phone", tel) : q.eq("email", mail!);
        const { data, error } = await q.limit(1);
        if (error) return { trouve: null, erreur: error.message };
        return { trouve: data?.[0] ?? null };
    };

    const premier = await chercher();
    if (premier.erreur) return { id: null, erreur: premier.erreur };

    if (premier.trouve) {
        /*
         * On COMPLÈTE les trous, on n'écrase rien.
         *
         * Quelqu'un qui réserve au téléphone puis laisse son e-mail la fois
         * suivante doit enrichir sa fiche. Mais un nom saisi à la va-vite ne
         * doit pas remplacer celui que le restaurant a corrigé à la main.
         */
        const complements: Record<string, string> = {};
        if (!premier.trouve.phone && tel) complements.phone = tel;
        if (!premier.trouve.email && mail) complements.email = mail;
        if (!premier.trouve.full_name && nom) complements.full_name = nom;
        if (Object.keys(complements).length > 0) {
            await sb.from("customers").update(complements).eq("id", premier.trouve.id);
        }
        return { id: premier.trouve.id as string };
    }

    const { data, error } = await sb
        .from("customers")
        .insert({ business_id: businessId, full_name: nom || null, phone: tel, email: mail, source })
        .select("id")
        .single();

    if (!error) return { id: data.id as string };

    /*
     * Deux réservations simultanées de la même personne : la première crée
     * la fiche pendant que la seconde cherchait encore. La base refuse le
     * doublon (`unique (business_id, email)`), et c'est tant mieux — on
     * relit alors, plutôt que de perdre la réservation.
     */
    if (/duplicate|unique/i.test(error.message)) {
        const second = await chercher();
        if (second.trouve) return { id: second.trouve.id as string };
    }
    return { id: null, erreur: error.message };
}
