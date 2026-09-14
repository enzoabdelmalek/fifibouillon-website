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

### Affichage par onglets

Les deux pages de carte utilisent [`components/menu-tabs.tsx`](components/menu-tabs.tsx) :
une famille affichée à la fois, barre d'onglets collante sous l'en-tête. Sans ça, la
page boissons faisait 10 500 px de haut pour une centaine de références — on s'y perdait.

Le regroupement en onglets se déclare dans chaque page (`const groups`), ce qui permet
de réunir plusieurs sections sous un même onglet (« Bières » couvre pression, bouteilles,
apéritifs et whiskies).

Trois points à garder en tête si tu y touches :

- **Tous les panneaux sont rendus dans le HTML**, seul l'affichage bascule. Google indexe
  donc la carte entière — vérifiable avec `curl` sur la page.
- **Le masquage est conditionné à la classe `js`** (cf. `globals.css`). Sans JavaScript,
  tous les panneaux restent affichés : la page est longue mais complète.
- **`MenuSectionBlock` reçoit `animate={false}` dans les onglets.** L'apparition au scroll
  repose sur IntersectionObserver, qui ne se déclenche jamais pour un panneau masqué : le
  contenu resterait invisible au changement d'onglet. Les panneaux ont leur propre fondu CSS.

## Thème clair / sombre

Piloté par la classe `dark` sur `<html>`.

- **Le site démarre toujours en clair.** La préférence système n'est
  volontairement pas suivie : un visiteur dont le téléphone est en mode sombre
  voit quand même le site en clair à sa première visite.
- La bascule de l'en-tête enregistre le choix dans `localStorage`
  (clé `fifi-theme`). Le mode sombre ne s'applique que si le visiteur l'a
  demandé, et son choix est conservé d'une page à l'autre.
- Un script inline dans `<head>` (`themeInitScript`) applique le thème **avant
  le premier rendu** : pas de flash au chargement.
- Ce même script pose la classe `js` sur `<html>`. Les animations d'apparition
  et les onglets de carte ne masquent leur contenu que sous `.js` — sans
  JavaScript, la page reste entièrement lisible.
- La balise `<meta name="theme-color">` (couleur de la barre d'adresse mobile)
  est réécrite à chaque bascule pour rester en accord avec la page.

### Animation de bascule

Fondu de 260 ms sur les couleurs, plus un fondu croisé rotatif des icônes
soleil / lune. La classe `.theme-transition` est posée sur `<html>` **le temps
de la bascule seulement**, puis retirée : laissée en place, sa règle
`transition … !important` sur `*` ferait traîner chaque survol du site.
Deux points à respecter si tu y touches :

- `TRANSITION_MS` (theme-toggle.tsx) doit rester aligné sur la durée déclarée
  dans `.theme-transition` (globals.css).
- La règle `!important` couvre `opacity` et `rotate` : sans ça, elle écraserait
  le fondu croisé des icônes pendant la bascule. Et Tailwind v4 génère la
  propriété autonome `rotate`, pas `transform` — une transition sur `transform`
  n'animerait rien.
- L'ensemble est désactivé sous `prefers-reduced-motion`.

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

### Hiérarchie

**Primaires : blanc et jaune beurre.** Ce sont eux qui portent la page — fonds,
bandeaux d'ouverture, cartes. **Secondaires : marron et rouge**, employés par
touches et jamais en grands aplats : le marron porte le texte, le rouge les
boutons, surtitres, ornements et l'onglet actif.

Le seul aplat sombre du site est le **pied de page** (`--footer-bg`), qui ancre
le bas de page.

⚠️ **`--primary` et `--brand-accent` ne sont pas interchangeables.**
`--primary` ne sert que de **fond** de bouton (texte crème dessus). `--brand-accent`
sert au **texte** accentué : surtitres, chiffres, ornements, onglet actif du menu
mobile. Un rouge assez sombre pour porter du texte crème est trop sombre pour être
lu *en texte* sur fond sombre — en mode sombre, `--brand-accent` bascule donc sur
l'or du logo (1,87:1 → 8:1). Utiliser `text-primary` pour du texte rouvre le bug.

En mode sombre, les fonds sont un anthracite chaud **désaturé**
(`#17120F` / `#201A17` / `#261F1B`) et non le Coffee Bean. Les deux teintes sont
des bruns rouges de valeurs voisines : côte à côte, le rouge de marque et un fond
Coffee Bean se brouillent. Fond désaturé, le rouge reste la seule couleur saturée
de la page et se détache franchement.

## Partage et SEO

- `app/opengraph-image.png` / `app/twitter-image.png` (1200 × 630) : aperçu affiché
  quand un lien du site est partagé (WhatsApp, Facebook, Instagram, iMessage).
  Régénérés à la main depuis le logo — à refaire si le logo change.
- Données structurées `Restaurant` dans `app/layout.tsx` : nom, adresse, téléphone,
  horaires, carte, image, fourchette de prix. Alimentées par `lib/site.ts`.
  Les horaires `schema` doivent rester cohérents avec les horaires affichés.
- `sitemap.xml` et `robots.txt` générés depuis `nav` et `site.url`.

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
