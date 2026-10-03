import "server-only";
import { getSupabase } from "@/lib/supabase";

/**
 * Lecture des articles, côté serveur uniquement.
 *
 * La table `blog_posts` est partagée par tous les sites clients, comme
 * `reservations` : c'est `business_id` qui les sépare. Ne JAMAIS interroger
 * sans ce filtre, sous peine d'afficher chez FiFi les articles d'un autre.
 *
 * Les pages sont régénérées au plus toutes les dix minutes : un article
 * publié apparaît donc vite, sans qu'un pic de trafic se traduise en un pic
 * de requêtes sur la base.
 *
 * ─── CE QUE LA v2 CHANGE ICI ─────────────────────────────────────────────
 *
 * La v1 avait un champ `date` en TEXTE libre, déjà mis en forme en français
 * (« 24 août 2024 ») : ni triable, ni donnable à Google, qui attend de
 * l'ISO. La v2 ne le reprend pas et donne `published_at`, une vraie date.
 * La migration recopie l'ancien texte en fin de contenu, donc rien n'est
 * perdu — il n'est simplement plus affiché comme une date.
 *
 * `display_order` disparaît aussi. Le client ne peut plus épingler un
 * article en tête : le classement est l'antériorité de publication. C'est
 * une fonction en moins, elle est notée ici pour qu'on ne la redécouvre pas
 * le jour où il la demandera.
 */

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  /** La catégorie de la v1 y a été migrée, en première étiquette. */
  tags: string[];
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  /** Null pour un brouillon — que ces fonctions ne renvoient jamais. */
  published_at: string | null;
  created_at: string;
};

const FIELDS = "id, slug, title, tags, excerpt, content, cover_url, published_at, created_at";

/** Table absente ou colonne inconnue : on dégrade au lieu de casser la page. */
function isSchemaMismatch(code: string | undefined): boolean {
  return code === "PGRST205" || code === "PGRST204" || code === "42P01" || code === "42703";
}

export async function listPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  if (!supabase.configured) return [];

  const { data, error } = await supabase.client
    .from("blog_posts")
    .select(FIELDS)
    .eq("business_id", supabase.businessId)
    // `published` et rien d'autre : un brouillon ou un article archivé ne
    // doit pas se retrouver en ligne parce qu'un filtre a été oublié.
    .eq("status", "published")
    // Le plus récemment publié d'abord. `created_at` départage les articles
    // migrés, qui portent tous la même `published_at`.
    .order("published_at", { ascending: false, nullsFirst: false })
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
    .from("blog_posts")
    .select(FIELDS)
    .eq("business_id", supabase.businessId)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (!isSchemaMismatch(error.code)) console.error("[blog] article :", error.message);
    return null;
  }

  return (data as BlogPost) ?? null;
}

/**
 * La catégorie affichée : la PREMIÈRE étiquette.
 *
 * La v1 avait une catégorie unique, la v2 a un tableau d'étiquettes, et la
 * migration y a mis l'ancienne catégorie seule. Le site n'affiche qu'une
 * valeur, donc on prend la première plutôt que d'inventer une mise en page
 * pour des étiquettes multiples que personne n'a encore demandées.
 */
export function categoryOf(post: BlogPost): string | null {
  return post.tags?.[0]?.trim() || null;
}

/**
 * Date affichée : celle de publication, à défaut celle de création.
 *
 * Le repli n'est pas théorique : la v2 autorise `published_at` vide sur un
 * article publié à la main depuis le dashboard. Un article sans date
 * paraîtrait négligé, donc on en montre toujours une.
 */
export function displayDate(post: BlogPost): string {
  return new Date(post.published_at ?? post.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

/**
 * Date lisible par une machine — Schema.org et sitemap.
 *
 * Même source que l'affichage. En v1 les deux divergeaient, parce que la
 * date visible était du texte libre et illisible pour un moteur ; ce n'est
 * plus le cas, et les faire coïncider évite qu'un article soit daté
 * autrement pour Google que pour un lecteur.
 */
export function machineDate(post: BlogPost): string {
  return post.published_at ?? post.created_at;
}
