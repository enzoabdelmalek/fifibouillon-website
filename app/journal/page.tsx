import type { Metadata } from "next";
import Link from "next/link";
import { Diamond } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { displayDate, listPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Le journal",
  description: `Actualités, nouveautés de la carte et coulisses du bouillon ${site.name}, ${site.district} de ${site.city}.`,
  alternates: { canonical: "/journal" },
};

/**
 * Les articles vivent en base : le client publie depuis le dashboard, le site
 * suit sans redéploiement. Dix minutes de cache - assez court pour qu'une
 * publication apparaisse vite, assez long pour qu'un pic de trafic ne se
 * traduise pas en un pic de requêtes.
 */
export const revalidate = 600;

export default async function JournalPage() {
  const posts = await listPosts();

  return (
    <>
      <PageHeader
        eyebrow="Le journal"
        title="Les nouvelles de la maison"
        intro="Ce qui change à la carte, ce qui se passe en salle, et quelques histoires de bouillon."
      />

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        {posts.length === 0 ? (
          <Reveal className="rounded-sm border border-line bg-surface px-8 py-14 text-center shadow-card">
            <p className="font-display text-2xl text-ink">Le premier article arrive bientôt.</p>
            <p className="mt-4 text-base/relaxed text-muted">
              En attendant, la carte et les horaires vous attendent.
            </p>
            <div aria-hidden className="rule-ornament mx-auto mt-8 max-w-[12rem]">
              <Diamond />
            </div>
            <Link
              href="/la-carte"
              className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
            >
              Découvrir la carte
            </Link>
          </Reveal>
        ) : (
          <ul className="space-y-px overflow-hidden rounded-sm border border-line bg-line">
            {posts.map((post, index) => (
              <li key={post.id} className="bg-surface">
                <Reveal delay={index * 60}>
                  <Link
                    href={`/journal/${post.slug}`}
                    className="group block px-7 py-8 transition-colors hover:bg-paper-alt sm:px-9 sm:py-10"
                  >
                    <p className="eyebrow text-gold">
                      {displayDate(post)}
                      {post.category ? ` · ${post.category}` : ""}
                    </p>
                    <h2 className="mt-4 font-display text-2xl/tight text-ink sm:text-3xl/tight">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 text-base/relaxed text-pretty text-muted">{post.excerpt}</p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center gap-3 py-1 text-[0.8rem] tracking-[0.16em] text-ink uppercase">
                      <span className="border-b border-accent pb-1">Lire</span>
                      <span
                        aria-hidden
                        className="text-gold transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
