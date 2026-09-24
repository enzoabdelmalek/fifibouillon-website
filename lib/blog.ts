import "server-only";
import { getSupabase } from "@/lib/supabase";

/**
 * Lecture des articles, côté serveur uniquement.
 *
 * La table `blog` est partagée par tous les sites clients, comme
 * `reservations` : c'est `business_id` qui les sépare. Ne JAMAIS interroger
 * sans ce filtre, sous peine d'afficher chez FiFi les articles d'un autre.
 *
 * Les pages sont régénérées au plus toutes les dix minutes : un article
 * publié apparaît donc vite, sans qu'un pic de trafic se traduise en un pic
 * de requêtes sur la base.
 *
 * ⚠️ Le champ `date` est du TEXTE libre, déjà mis en forme en français
 * (« 24 août 2024 »). Il ne peut donc ni être trié ni être donné à Google,
 * qui attend une date ISO. On l'affiche tel quel, et on s'appuie sur
 * `created_at` pour tout ce qui doit être lisible par une machine.
 */

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  /** Date d'affichage, écrite à la main. Peut être vide. */
  date: string | null;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  created_at: string;
};

const FIELDS = "id, slug, title, date, category, excerpt, content, cover_url, created_at";

/** Table absente ou colonne inconnue : on dégrade au lieu de casser la page. */
function isSchemaMismatch(code: string | undefined): boolean {
  return code === "PGRST205" || code === "PGRST204" || code === "42P01" || code === "42703";
}

export async function listPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  if (!supabase.configured) return [];

  const { data, error } = await supabase.client
    .from("blog")
    .select(FIELDS)
    .eq("business_id", supabase.businessId)
    .eq("active", true)
    // `display_order` d'abord : c'est le levier du client pour mettre un
    // article en avant. À égalité, le plus récent passe devant.
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (!isSchemaMismatch(error.code)) console.error("[blog] liste :", error.message);
    return [];
  }

  return (data ?? []) as BlogPost[];
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  if (!supabase.configured) return null;

  const { data, error } = await supabase.client
    .from("blog")
    .select(FIELDS)
    .eq("business_id", supabase.businessId)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    if (!isSchemaMismatch(error.code)) console.error("[blog] article :", error.message);
    return null;
  }

  return (data as BlogPost) ?? null;
}

/**
 * Date affichée : celle écrite par le client si elle existe, sinon celle de
 * création mise en forme. Un article sans date paraîtrait négligé.
 */
export function displayDate(post: BlogPost): string {
  if (post.date?.trim()) return post.date.trim();
  return new Date(post.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

/** Date lisible par une machine - Schema.org et sitemap. Jamais le texte libre. */
export function machineDate(post: BlogPost): string {
  return post.created_at;
}
