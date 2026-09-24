import type { Metadata } from "next";
import { LegalLayout, LegalRow, LegalSection } from "@/components/legal-layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site de ${site.fullName} : éditeur, hébergeur et propriété intellectuelle.`,
  alternates: { canonical: "/mentions-legales" },
  // Ces pages n'ont aucune valeur en recherche et diluent le maillage interne.
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      eyebrow="Informations légales"
      title="Mentions légales"
      intro="Les informations relatives à l’éditeur et à l’hébergeur de ce site."
    >
      <LegalSection title="Éditeur du site">
        <LegalRow label="Dénomination sociale">{site.legal.companyName}</LegalRow>
        <LegalRow label="Forme juridique">{site.legal.legalForm}</LegalRow>
        <LegalRow label="Capital social">{site.legal.capital}</LegalRow>
        <LegalRow label="SIREN">{site.legal.siren}</LegalRow>
        <LegalRow label="RCS">{site.legal.rcs}</LegalRow>
        <LegalRow label="N° de TVA intracommunautaire">{site.legal.vatNumber}</LegalRow>
        <LegalRow label="Siège social">
          {site.address.street}, {site.address.postalCode} {site.address.city}
        </LegalRow>
        <LegalRow label="Téléphone">
          <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="underline underline-offset-4 decoration-1 hover:decoration-2">
            {site.contact.phoneDisplay}
          </a>
        </LegalRow>
        <LegalRow label="E-mail">
          <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4 decoration-1 hover:decoration-2">
            {site.contact.email}
          </a>
        </LegalRow>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>{site.legal.publicationDirector}</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <LegalRow label="Hébergeur">{site.legal.host.name}</LegalRow>
        <p>{site.legal.host.address}</p>
        <p>
          <a
            href={site.legal.host.url}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4 decoration-1 hover:decoration-2"
          >
            {site.legal.host.url.replace("https://", "")}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des contenus de ce site - textes, photographies, illustrations,
          identité visuelle et structure - est protégé par le droit d’auteur. Toute
          reproduction ou représentation, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le formulaire de réservation collecte des données personnelles. Leur
          traitement est détaillé dans notre{" "}
          <a href="/confidentialite" className="text-brand-accent underline underline-offset-4 decoration-1 hover:decoration-2">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cookies et traceurs">
        <p>
          Ce site ne dépose aucun cookie publicitaire et ne partage rien avec des régies
          ou des réseaux sociaux. Il utilise une mesure d’audience limitée à ses propres
          pages, décrite dans la{" "}
          <a href="/confidentialite" className="text-brand-accent underline underline-offset-4 decoration-1 hover:decoration-2">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
