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
 */
export type ReservationRow = {
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_mail: string;
  /** Instant de la réservation, en ISO 8601 UTC. */
  date: string;
  guests: number;
  message: string | null;
  status: "scheduled";
  attended: boolean | null;
};

/**
 * Un article de la table `blog`, partagée par tous les sites clients.
 *
 * `date` est du texte libre déjà mis en forme (« 24 août 2024 ») : il ne se
 * trie pas et ne vaut rien pour un moteur. `created_at` sert pour tout ce qui
 * doit être lisible par une machine.
 */
export type BlogRow = {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  date: string | null;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  active: boolean;
  display_order: number;
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
      blog: {
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
