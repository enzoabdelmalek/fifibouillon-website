import type { NextConfig } from "next";

/**
 * En-têtes de sécurité, appliqués à toutes les réponses.
 *
 * Le site reçoit des noms, des téléphones et des e-mails via le formulaire de
 * réservation : ces quelques lignes ferment les attaques les plus banales, qui
 * ne demandent aucune compétence particulière pour être tentées.
 */
const securityHeaders = [
  {
    // Impose HTTPS pour deux ans, y compris sur les sous-domaines. Sans lui,
    // la toute première visite peut encore passer en clair et être interceptée.
    // `preload` autorise l'inscription sur la liste des navigateurs :
    // à ne demander qu'une fois le domaine définitivement en HTTPS.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Interdit au navigateur de deviner le type d'un fichier. Un fichier
    // déposé qui serait servi comme du JavaScript devient inoffensif.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // L'adresse complète de la page n'est transmise qu'aux sites de même
    // origine ; à l'extérieur, seul le domaine part. Évite de divulguer
    // une page de confirmation de réservation dans un referer.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Empêche l'inclusion du site dans une iframe : c'est la parade au
    // détournement de clic, où un tiers superpose sa page à la nôtre pour
    // faire cliquer le visiteur sans qu'il s'en rende compte.
    // frame-ancestors remplace X-Frame-Options, qui n'accepte pas de liste.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'",
  },
  {
    // Le site n'a besoin ni de la caméra, ni du micro, ni de la position.
    // On les refuse explicitement, y compris pour d'éventuelles iframes.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Ne pas annoncer la version du framework : c'est une indication gratuite
  // donnée à qui cherche une faille connue.
  poweredByHeader: false,

  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

export default nextConfig;
