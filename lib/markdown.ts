/**
 * Rendu Markdown minimal.
 *
 * Pourquoi pas une bibliothèque : le contenu vient de la base, donc d'un
 * écran d'administration. Une bibliothèque Markdown rend le HTML brut telle
 * quelle par défaut - il suffirait qu'un compte du dashboard soit compromis,
 * ou qu'un import se passe mal, pour qu'un `<script>` atterrisse sur le site
 * public. Ici, on échappe TOUT d'abord, puis on n'autorise que la poignée de
 * balises qu'on écrit soi-même. Aucune entrée ne peut produire de HTML
 * arbitraire, et il n'y a pas de dépendance à surveiller.
 *
 * Syntaxe reconnue : titres ## et ###, paragraphes, listes à puces, liens,
 * gras, italique, citations. C'est ce qu'un restaurateur écrit.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Gras, italique et liens - appliqués APRÈS l'échappement. */
function inline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_m, label, href) => {
      const external = href.startsWith("http");
      const attrs = external ? ' target="_blank" rel="noreferrer noopener"' : "";
      return `<a href="${href}" class="text-brand-accent underline underline-offset-4 decoration-1 hover:decoration-2"${attrs}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

export function renderMarkdown(source: string): string {
  const blocks = escapeHtml(source.replace(/\r\n/g, "\n"))
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      if (block.startsWith("### ")) {
        return `<h3 class="mt-10 font-display text-xl text-ink sm:text-2xl">${inline(block.slice(4))}</h3>`;
      }
      if (block.startsWith("## ")) {
        return `<h2 class="mt-12 font-display text-2xl text-ink sm:text-3xl">${inline(block.slice(3))}</h2>`;
      }
      if (block.startsWith("&gt; ")) {
        const quote = block
          .split("\n")
          .map((line) => line.replace(/^&gt;\s?/, ""))
          .join(" ");
        return `<blockquote class="mt-8 border-l-2 border-accent pl-5 font-display text-xl/relaxed text-ink">${inline(quote)}</blockquote>`;
      }
      if (/^[-*]\s/.test(block)) {
        const items = block
          .split("\n")
          .filter((line) => /^[-*]\s/.test(line))
          .map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul class="mt-6 list-disc space-y-2 pl-5">${items}</ul>`;
      }
      return `<p class="mt-6 text-base/relaxed text-pretty">${inline(block.replace(/\n/g, "<br />"))}</p>`;
    })
    .join("\n");
}
