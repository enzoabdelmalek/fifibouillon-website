/**
 * Limitation de débit par adresse IP.
 *
 * Sans elle, une boucle `curl` de trois lignes remplit le carnet du
 * restaurant de fausses tables, épuise le quota d'envoi d'e-mails et noie la
 * boîte du gérant. Aucune compétence particulière n'est requise pour le
 * faire, c'est ce qui rend l'absence de garde-fou sérieuse.
 *
 * ⚠️ Le compteur vit en mémoire, donc dans UNE instance de serveur. Sur un
 * hébergement sans état comme Vercel, plusieurs instances coexistent et
 * chacune a son compteur : la limite réelle est donc plus haute que celle
 * annoncée ici, et elle se remet à zéro au redémarrage. C'est suffisant
 * contre un script naïf, pas contre une attaque distribuée. Un vrai plafond
 * demanderait un magasin partagé (Redis, Upstash) - à faire si le site prend
 * de l'ampleur, ou si le formulaire commence à être visé.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

/** Au-delà, on purge les fenêtres expirées : la mémoire ne doit pas enfler. */
const CLEANUP_THRESHOLD = 5_000;

function sweep(now: number) {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Adresse de l'appelant.
 *
 * Derrière un proxy, `x-forwarded-for` contient la chaîne complète des
 * relais : c'est la PREMIÈRE adresse qui est celle du client. Prendre la
 * dernière reviendrait à limiter le proxy lui-même, donc tout le monde d'un
 * coup. L'en-tête reste falsifiable par nature ; sur Vercel il est réécrit
 * en amont, mais on ne s'y fie que pour du confort, pas pour de l'identité.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "inconnue";
}

export type RateLimitResult = {
  allowed: boolean;
  /** Secondes à attendre avant de réessayer, pour l'en-tête `Retry-After`. */
  retryAfter: number;
};

/**
 * Consomme un jeton pour `key`, dans une fenêtre glissante par paliers.
 *
 * @param limit  nombre de requêtes autorisées par fenêtre
 * @param windowMs durée de la fenêtre, en millisecondes
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > CLEANUP_THRESHOLD) sweep(now);

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;

  if (current.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfter: 0 };
}

/** Réinitialise les compteurs. Réservé aux tests. */
export function resetRateLimits() {
  buckets.clear();
}
