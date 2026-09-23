import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Jost, Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { themeInitScript } from "@/components/theme-toggle";
import { env } from "@/lib/env";
import { site } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} — ${site.district}, ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.fullName,
  keywords: [
    "bouillon Paris",
    "brasserie Paris 9",
    "restaurant 9ème arrondissement",
    "cuisine française",
    "happy hour Paris",
    "FiFi bouillon",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.fullName,
    title: `${site.fullName} — ${site.district}, ${site.city}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.fullName,
    description: site.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  /* Valeur unique et non conditionnée aux préférences système : le site
     démarre toujours en clair. Le script de thème réécrit cette balise quand
     le visiteur bascule en sombre (cf. components/theme-toggle.tsx). */
  themeColor: "#fffdf6",
};

/** Données structurées — aide Google à afficher horaires, adresse et carte. */
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.fullName,
  description: site.description,
  url: site.url,
  telephone: site.contact.phone,
  email: site.contact.email,
  servesCuisine: "Française",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressCountry: site.address.country,
  },
  hasMenu: [`${site.url}/la-carte`, `${site.url}/les-boissons`],
  acceptsReservations: `${site.url}/reserver`,
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${site.url}/reserver`,
      inLanguage: "fr-FR",
      actionPlatform: [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
      ],
    },
    result: { "@type": "FoodEstablishmentReservation", name: "Réserver une table" },
  },
  openingHoursSpecification: site.hours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.schema.days,
    opens: slot.schema.opens,
    closes: slot.schema.closes,
  })),
  // Google s'en sert pour le positionnement local : sans coordonnées, il
  // géocode l'adresse lui-même, et « 56B » n'est pas toujours bien résolu.
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.address.latitude,
    longitude: site.address.longitude,
  },
  image: `${site.url}/opengraph-image.png`,
  sameAs: [site.social.instagram, site.social.tiktok, site.social.facebook].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:text-on-primary"
        >
          Aller au contenu
        </a>

        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />

        {/* Tracker de visites VWA → table `sessions`, lue par le dashboard.
            L'identifiant n'est pas un secret (il est visible dans l'URL du
            script) : le layout étant un composant serveur, on lit la même
            variable BUSINESS_ID que les réservations, sans NEXT_PUBLIC_. */}
        {env.businessId() ? (
          <Script
            src={`https://tracker-production-9a75.up.railway.app/track.js?id=${env.businessId()}`}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
