import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Les liens de suivi de réservation portent un identifiant et affichent
      // un prénom : ils n'ont rien à faire dans un index. La page est déjà en
      // `noindex`, mais encore faut-il qu'un robot la charge pour le lire -
      // ici, il ne la demande même pas.
      //
      // Le motif se termine par une barre oblique : il ne couvre que les
      // sous-chemins. La page /reserver elle-même reste indexée, c'est elle
      // qu'on veut voir remonter.
      disallow: ["/reserver/"],
    },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
