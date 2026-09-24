import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Diamond } from "@/components/menu";
import { PageHeader } from "@/components/page-header";
import { displayDate, getPost, listPosts, machineDate } from "@/lib/blog";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";

export const revalidate = 600;

type Params = { params: Promise<{ slug: string }> };

/**
 * Les articles publiés sont connus au moment de la construction : ils sont
 * donc générés statiquement. Un article publié après coup reste servi, grâce
 * à la régénération - il n'est simplement pas prêt d'avance.
 */
export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article introuvable" };

  const description = post.excerpt ?? `Un article du journal de ${site.fullName}.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: machineDate(post),
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Un brouillon, un article archivé ou un slug inventé donnent un vrai 404 -
  // jamais une page vide renvoyée en 200, que Google indexerait.
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: machineDate(post),
    image: post.cover_url ?? undefined,
    author: { "@type": "Organization", name: site.fullName },
    publisher: { "@type": "Organization", name: site.fullName },
    mainEntityOfPage: new URL(`/journal/${post.slug}`, site.url).toString(),
  };

  return (
    <>
      <PageHeader
        eyebrow={displayDate(post)}
        title={post.title}
        intro={post.excerpt ?? undefined}
      />

      <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <div
          className="text-muted"
          // Le contenu est échappé puis reconstruit par renderMarkdown : aucune
          // balise ne provient de la base, seulement celles qu'on écrit ici.
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content ?? "") }}
        />

        {post.category ? (
          <p className="mt-12">
            <span className="rounded-full border border-line px-4 py-1.5 text-xs tracking-[0.12em] text-muted uppercase">
              {post.category}
            </span>
          </p>
        ) : null}

        <div aria-hidden className="rule-ornament mx-auto mt-14 max-w-xs">
          <Diamond />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/reserver"
            className="rounded-full bg-primary px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-on-primary uppercase transition-colors hover:bg-primary-hover"
          >
            Réserver une table
          </Link>
          <Link
            href="/journal"
            className="rounded-full border border-line-strong px-7 py-3.5 text-[0.8rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-paper-alt"
          >
            Tous les articles
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
