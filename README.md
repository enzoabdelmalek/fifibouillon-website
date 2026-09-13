# FiFi — Bouillon & Brasserie

Site vitrine du bouillon FiFi (9ᵉ arrondissement, Paris).
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.

Entièrement statique : les 5 pages sont pré-rendues au build, aucun serveur
applicatif n'est nécessaire à l'exécution.

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # sert le build
npm run lint
```

---

## ⚠️ À compléter avant mise en ligne

Toutes les informations pratiques sont centralisées dans **[`lib/site.ts`](lib/site.ts)**.
Les valeurs commentées `// À COMPLÉTER` sont des espaces réservés :

| Champ | Où ça s'affiche |
| --- | --- |
| `url` | métadonnées Open Graph, `sitemap.xml`, `robots.txt` |
| `contact.phone` / `phoneDisplay` / `email` | en-tête, pied de page, pages Carte et Nous trouver |
| `address.street` | pied de page, accueil, Nous trouver, données Schema.org |
| `mapsUrl` | boutons « Itinéraire » |
| `transport` | page Nous trouver (métro / bus) |
| `social.instagram` / `facebook` | pied de page (un champ vide masque le lien) |
| `hours` | pied de page, accueil, Nous trouver |

Un seul fichier à éditer : tout le site se met à jour.

---

## Structure

```
app/
  layout.tsx          en-tête, pied de page, polices, métadonnées, Schema.org
  page.tsx            accueil (hero, maison, incontournables, cartes, happy hour, accès)
  la-carte/           carte à manger
  les-boissons/       cocktails, vins, bières, apéritifs, cafétéria
  la-maison/          histoire et parti pris
  nous-trouver/       adresse, horaires, contact
  not-found.tsx       page 404
  sitemap.ts robots.ts
  icon.png            favicon (le chat du logo sur fond bordeaux)
  globals.css         design tokens clair/sombre + composants CSS
components/
  site-header.tsx     en-tête fixe, nav, menu mobile plein écran
  site-footer.tsx
  theme-toggle.tsx    bascule clair/sombre + script anti-flash
  logo.tsx            Logo (blason), Wordmark (lettrage), CatMark (chat)
  menu.tsx            lignes et sections de carte
  page-header.tsx     bandeau de titre des pages intérieures
  reveal.tsx          apparition au scroll
lib/
  site.ts             ⚠️ informations pratiques
  menu.ts             contenu des deux cartes
```

## Cartes

Le contenu des cartes vit dans **[`lib/menu.ts`](lib/menu.ts)**, transcrit depuis les
PDF fournis par le client. Les PDF restent téléchargeables depuis le site
(`public/Menu food.pdf`, `public/Menu boisson.pdf`) : **lors d'un changement de
carte, mettre à jour les deux** — les données ET les PDF.

## Thème clair / sombre

Piloté par la classe `dark` sur `<html>`.

- Par défaut, le site suit les préférences système du visiteur.
- La bascule de l'en-tête enregistre un choix explicite dans `localStorage`
  (clé `fifi-theme`), qui prend alors le pas sur le système.
- Un script inline dans `<head>` (`themeInitScript`) applique le thème **avant
  le premier rendu** : pas de flash de thème clair au chargement.
- Ce même script pose la classe `js` sur `<html>`. Les animations d'apparition
  ne masquent leur contenu que sous `.js` — sans JavaScript, la page reste
  entièrement lisible.

Les couleurs sont des variables CSS définies dans `app/globals.css`
(`:root` pour le clair, `.dark` pour le sombre) puis exposées à Tailwind via
`@theme inline`. Pour retoucher la palette, il suffit de modifier ces
variables : `bg-paper`, `text-ink`, `text-gold`, `border-line`, etc. suivent.

### Palette

| Nom | Hex | Usage |
| --- | --- | --- |
| Lemon Chiffon | `#FFF8CA` | fond alterné (clair), texte (sombre) |
| Rosewood | `#6B0B0C` | bandeaux, boutons principaux |
| Coffee Bean | `#2D120D` | texte (clair) |
| Botticelli | `#CDE3E8` | accent froid, en réserve |
| Or du logo | `#C8920E` | filets, ornements, numérotation |

Le bordeaux des grands bandeaux (hero, bandeaux de titre, happy hour, pied de
page) est **identique dans les deux thèmes** : c'est la constante de la marque.

En mode sombre, les fonds de page sont un anthracite chaud **désaturé**
(`#17120F` / `#201A17` / `#261F1B`) et non le Coffee Bean. Les deux teintes sont
des bruns rouges de valeurs voisines : côte à côte, le Rosewood des bandeaux et
un fond Coffee Bean se brouillent. Fond désaturé, le bordeaux redevient la seule
couleur saturée de la page et se détache franchement.

## Assets

Les logos fournis étaient des JPEG à fond plein. Ils ont été détourés et
recadrés ; les fichiers dérivés sont dans `public/assets/` :

| Fichier | Usage |
| --- | --- |
| `logo-light.png` / `logo-dark.png` | blason complet, pour fonds clairs / sombres |
| `wordmark-light.png` / `wordmark-dark.png` | lettrage « FiFi » seul — le blason vertical devient illisible sous ~80 px, c'est cette version qu'utilise l'en-tête |
| `cat.png` | le chat seul, en ornement (filigranes, 404) |
| `app/icon.png` | favicon |

Les originaux (`LogoNoir.jpeg`, `LogoBlanc.jpeg`, `Couleurs.jpeg`) sont conservés.

## Pas de réservation

Le site est volontairement une vitrine : les appels à l'action pointent vers le
téléphone et l'itinéraire. Pour ajouter un module de réservation plus tard, les
boutons concernés sont dans `app/page.tsx` (hero et section « Nous trouver »),
`components/site-header.tsx` et `app/nous-trouver/page.tsx`.

## Accessibilité

Navigation au clavier complète, lien d'évitement vers le contenu, `aria-current`
sur l'onglet actif, menu mobile fermable à l'échap, contrastes vérifiés dans les
deux thèmes, et respect de `prefers-reduced-motion` (les apparitions au scroll
sont alors désactivées).
# fifibouillon-website
