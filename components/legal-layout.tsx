import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

/**
 * Mise en page commune aux textes légaux.
 *
 * Volontairement sobre et en pleine largeur de lecture : ces pages se lisent,
 * elles ne se contemplent pas. Pas d'animation d'apparition non plus — un
 * texte légal doit être visible même si le JavaScript ne s'exécute pas.
 */
export function LegalLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  const updated = new Date(site.legal.updatedOn).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="space-y-12">{children}</div>

        <p className="mt-16 border-t border-line pt-6 text-sm text-muted">
          Dernière mise à jour : {updated}.
        </p>
      </div>
    </>
  );
}

/** Une section de texte légal : un titre, puis du contenu. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-4 text-base/relaxed text-muted">{children}</div>
    </section>
  );
}

/** Ligne « Libellé : valeur » des mentions légales. */
export function LegalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-medium text-ink">{label} :</span> {children}
    </p>
  );
}
