import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Client Supabase **serveur uniquement**.
 *
 * Contrairement au site Toscana, la clé n'est jamais exposée au navigateur :
 * pas de préfixe `NEXT_PUBLIC_`. La table `reservations` contient des noms,
 * des téléphones et des e-mails ; si le navigateur porte une clé capable de
 * la lire, n'importe quel visiteur peut la lire aussi. Tous les accès passent
 * donc par les routes d'API, qui ne renvoient jamais que des comptages.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` est la clé attendue (elle contourne les RLS et
 * ne doit jamais quitter le serveur). `SUPABASE_ANON_KEY` est accepté en repli
 * si les politiques RLS autorisent déjà l'insertion.
 */
function readEnv() {
  return { url: env.supabaseUrl(), key: env.supabaseKey(), businessId: env.businessId() };
}

/**
 * Colonnes de la table `reservations`, identiques à celles du site Toscana :
 * les deux restaurants partagent le même projet Supabase et le même dashboard,
 * distingués par `business_id`. Ne pas renommer sans migrer le dashboard.
 *
 * ─── SCHÉMA v2 ───────────────────────────────────────────────────────────
 *
 * Les noms ont changé, et PAS seulement les noms :
 *
 *   date           → starts_at
 *   guests         → party_size
 *   message        → customer_message
 *   customer_name  → guest_name, plus `customer_id` vers la table `customers`
 *   status         'scheduled' → 'confirmed'
 *
 * Le piège est le statut. `scheduled` n'existe plus, et un filtre
 * `status = 'scheduled'` ne lève AUCUNE erreur : il renvoie zéro ligne.
 * Toutes les tables paraîtraient libres, et FiFi découvrirait la
 * surréservation un samedi soir. C'est pour ça qu'on filtre désormais par
 * ce qui N'occupe PAS une table — une annulation, un lapin — plutôt que par
 * la liste de ce qui l'occupe : une valeur ajoutée plus tard sera comptée
 * par défaut, ce qui est le sens prudent de l'erreur.
 */
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

/** Les statuts qui ne retiennent plus de table. Voir ci-dessus. */
export const STATUTS_LIBERES = ["cancelled", "no_show"] as const;

/**
 * Une demande de devis. Les privatisations atterrissent ici : elles ne
 * bloquent pas un créneau, elles ouvrent une discussion — et le dashboard a
 * déjà un écran pour les traiter.
 *
 * En v2, `customer_id` est OBLIGATOIRE : une demande est toujours rattachée
 * à une fiche client. C'est tenable ici parce que le formulaire exige le nom,
 * l'e-mail ET le téléphone — contrairement à une réservation, où un client de
 * passage peut n'avoir qu'un prénom.
 *
 * `request_details` garde les champs du formulaire TELS QUELS, en plus du
 * récapitulatif en prose. Le texte est ce que le restaurant lit ; le jsonb
 * est ce qu'on pourra rechercher ou compter plus tard sans réanalyser des
 * phrases.
 */
export type QuoteRow = {
  business_id: string;
  customer_id: string;
  status: "request";
  title: string;
  request_message: string;
  request_details: Record<string, unknown>;
};

export type ReservationRow = {
  business_id: string;
  /** La fiche client. `null` = client de passage, `guest_name` porte alors le nom. */
  customer_id: string | null;
  /** Le nom donné POUR CE SOIR-LÀ, qui peut différer de celui de la fiche. */
  guest_name: string;
  /** Instant de la réservation, en ISO 8601 UTC. */
  starts_at: string;
  party_size: number;
  customer_message: string | null;
  /**
   * Le site ne crée que des réservations « confirmed ». Les autres valeurs
   * viennent du dashboard ou de l'annulation par le client : il faut les
   * connaître pour les lire, même si on ne les écrit pas toutes.
   */
  status: ReservationStatus;
  /** La base impose `cancelled_at` non nul quand et seulement quand `status = 'cancelled'`. */
  cancelled_at?: string | null;
  source: "website";
};

/** Une fiche client. Le site n'en lit que de quoi la retrouver. */
export type CustomerRow = {
  id: string;
  business_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: "reservation" | "quote" | "form";
};

/**
 * Un article de la table `blog_posts`, partagée par tous les sites clients.
 *
 * ─── CE QUI A DISPARU EN v2 ──────────────────────────────────────────────
 *
 * `date` était du texte libre déjà mis en forme (« 24 août 2024 ») : il ne
 * se triait pas et ne valait rien pour un moteur. La v2 ne le reprend pas —
 * la migration le recopie en fin de contenu pour ne rien perdre, et
 * `published_at` porte la vraie date.
 *
 * `active` devient `status`, et `display_order` n'existe plus : le classement
 * se fait par date de publication. Le client perd le levier « épingler un
 * article en tête » ; c'est à signaler plutôt qu'à masquer.
 */
export type BlogRow = {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  /** Remplace `category`, qui était unique. La migration y a mis l'ancienne. */
  tags: string[];
  status: "draft" | "published" | "archived";
  /** Null tant que l'article n'est pas publié. */
  published_at: string | null;
  created_at: string;
};

/** Schéma minimal : sans lui, supabase-js type toutes les tables en `never`. */
type Database = {
  public: {
    Tables: {
      reservations: {
        Row: ReservationRow & { id: string };
        Insert: ReservationRow;
        Update: Partial<ReservationRow>;
        Relationships: [];
      };
      quotes: {
        Row: QuoteRow & { id: string; created_at: string };
        Insert: QuoteRow;
        Update: Partial<QuoteRow>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, "id">;
        Update: Partial<CustomerRow>;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogRow;
        Insert: Partial<BlogRow>;
        Update: Partial<BlogRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type SupabaseConfigError = { configured: false; missing: string[] };

export function getSupabase():
  | { configured: true; client: ReturnType<typeof createClient<Database>>; businessId: string }
  | SupabaseConfigError {
  const { url, key, businessId } = readEnv();

  const missing = [
    !url && "SUPABASE_URL",
    !key && "SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    !businessId && "BUSINESS_ID",
  ].filter(Boolean) as string[];

  if (missing.length) return { configured: false, missing };

  return {
    configured: true,
    businessId: businessId!,
    client: createClient<Database>(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}
