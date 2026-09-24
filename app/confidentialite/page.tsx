import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Données collectées par ${site.fullName}, finalités, durées de conservation et exercice de vos droits.`,
  alternates: { canonical: "/confidentialite" },
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      eyebrow="Vos données"
      title="Politique de confidentialité"
      intro="Ce que nous collectons, pourquoi, combien de temps, et comment reprendre la main."
    >
      <LegalSection title="Qui est responsable">
        <p>
          {site.legal.companyName}, qui exploite le restaurant {site.fullName}, situé{" "}
          {site.address.street}, {site.address.postalCode} {site.address.city}. Pour toute
          question relative à vos données, écrivez à{" "}
          <a href={`mailto:${site.contact.email}`} className="text-brand-accent underline-offset-4 hover:underline">
            {site.contact.email}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Réservation d’une table">
        <p>
          Lorsque vous réservez, nous collectons votre <strong>nom</strong>, votre{" "}
          <strong>téléphone</strong>, votre <strong>adresse e-mail</strong>, la{" "}
          <strong>date et l’heure</strong> souhaitées, le <strong>nombre de convives</strong>{" "}
          et, si vous en laissez un, votre <strong>message</strong> (allergies, occasion).
        </p>
        <p>
          Ces informations servent uniquement à tenir la réservation : préparer votre table,
          vous envoyer la confirmation, et vous joindre en cas d’imprévu. Le message est
          libre : n’y indiquez que ce qui est utile au service.
        </p>
        <p>
          La base légale est l’exécution de mesures précontractuelles prises à votre demande.
          Sans ces informations, nous ne pouvons pas enregistrer la réservation ; vous pouvez
          toujours réserver par téléphone au {site.contact.phoneDisplay}.
        </p>
        <p>
          Elles sont conservées {site.legal.retention.reservationMonths} mois après la date de votre
          venue, puis supprimées.
        </p>
      </LegalSection>

      <LegalSection title="Mesure d’audience">
        <p>
          Nous mesurons la fréquentation du site pour savoir quelles pages sont consultées.
          Sont enregistrés : les <strong>pages vues</strong>, la <strong>page d’où vous
          venez</strong>, la <strong>largeur de votre écran</strong>, votre{" "}
          <strong>navigateur</strong> et la <strong>durée de la visite</strong>. Votre
          adresse IP n’est pas conservée.
        </p>
        <p>
          Un identifiant aléatoire est enregistré dans votre navigateur pour ne pas compter
          deux fois la même visite. Il ne contient rien qui vous identifie, il ne suit que ce
          site et il n’est recoupé avec aucun autre. Ces données ne sont ni vendues ni
          partagées, et sont conservées {site.legal.retention.analyticsMonths} mois.
        </p>
        <p>
          Pour ne pas être compté, il suffit de refuser le stockage local dans les réglages de
          votre navigateur, ou d’activer sa protection contre le pistage.
        </p>
      </LegalSection>

      <LegalSection title="Préférence d’affichage">
        <p>
          Votre choix de thème clair ou sombre est conservé dans votre navigateur. Il ne nous
          est jamais transmis et reste sur votre appareil.
        </p>
      </LegalSection>

      <LegalSection title="Qui d’autre y a accès">
        <p>
          L’équipe du restaurant, et deux prestataires techniques qui agissent sur nos
          instructions : <strong>Supabase</strong>, qui héberge la base de réservations sur
          des serveurs situés dans l’Union européenne, et <strong>Resend</strong>, qui
          achemine les e-mails de confirmation.
        </p>
        <p>
          Aucune donnée n’est vendue, louée, ni transmise à des fins publicitaires.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Vous pouvez demander à consulter vos données, les faire corriger ou effacer, en
          limiter l’usage, ou vous opposer à leur traitement. Écrivez à{" "}
          <a href={`mailto:${site.contact.email}`} className="text-brand-accent underline-offset-4 hover:underline">
            {site.contact.email}
          </a>{" "}
          : nous répondons sous un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL -{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand-accent underline-offset-4 hover:underline"
          >
            cnil.fr
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
