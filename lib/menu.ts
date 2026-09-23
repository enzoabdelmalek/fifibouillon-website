/**
 * Cartes du restaurant, transcrites depuis les PDF fournis par le client
 * (`public/Menu food.pdf` et `public/Menu boisson.pdf`).
 *
 * Les PDF restent téléchargeables depuis le site : pense à mettre à jour
 * ces données ET les fichiers PDF lors d'un changement de carte.
 */

export type MenuItem = {
  name: string;
  /** Prix formaté, ex. « 13,50 € » ou « 6 € / 28 € » (verre / bouteille). */
  price?: string;
  /** Composition ou précision, affichée en plus petit sous l'intitulé. */
  desc?: string;
};

export type MenuSection = {
  title: string;
  /** Précision affichée sous le titre de section. */
  subtitle?: string;
  /** Mention affichée en fin de section (suppléments, etc.). */
  note?: string;
  items: MenuItem[];
};

/* ------------------------------------------------------------------ */
/*  La carte                                                           */
/* ------------------------------------------------------------------ */

export const foodMenu: MenuSection[] = [
  {
    title: "Les entrées",
    note: "Supplément mayonnaise à la truffe + 1 €",
    items: [
      { name: "Œufs mayonnaise", price: "3,90 €" },
      { name: "Poireaux vinaigrette", price: "4,90 €" },
      { name: "Pâté de campagne", price: "5 €" },
      { name: "Soupe à l’oignon gratinée", price: "6 €" },
      { name: "Velouté du moment", price: "6,50 €" },
      { name: "Filets de harengs", price: "7 €" },
      { name: "Toast de chèvre chaud", price: "8,50 €" },
      { name: "Œuf poché au Bleu d’Auvergne", price: "9 €" },
      { name: "Cassolette d’escargots en persillade", price: "9,90 €" },
      { name: "Burrata & tomates", price: "9,90 €" },
    ],
  },
  {
    title: "Les salades",
    items: [
      { name: "Salade végétarienne", price: "13,50 €" },
      { name: "Salade César", desc: "Poulet croustillant", price: "15 €" },
    ],
  },
  {
    title: "Les plats",
    note:
      "Supplément garnitures 4 € : salade verte · légumes de saison · aligot · pommes grenailles · frites maison · coquillettes",
    items: [
      { name: "Cuisse de poulet rôtie au thym", desc: "Frites", price: "9,90 €" },
      {
        name: "Coquillettes crémeuses à la truffe",
        desc: "Supplément jambon blanc supérieur + 3 €",
        price: "11 €",
      },
      { name: "Saucisse & aligot", price: "12 €" },
      { name: "Bœuf bourguignon", desc: "Coquillettes", price: "13,50 €" },
      { name: "Burger FIFI", desc: "Poulet pané ou bœuf", price: "15 €" },
      { name: "Confit de canard", desc: "Pommes grenailles", price: "16 €" },
      { name: "Tartare de bœuf", desc: "Frites", price: "16 €" },
      { name: "Pièce du boucher", desc: "Frites, sauce au poivre", price: "17 €" },
      { name: "Pavé de saumon snacké", desc: "Légumes", price: "17 €" },
    ],
  },
  {
    title: "Les desserts",
    items: [
      { name: "Fromage blanc fermier", desc: "Coulis de fruits rouges ou miel", price: "4 €" },
      { name: "Mousse au chocolat", price: "4,50 €" },
      {
        name: "Assiette de fromages",
        desc: "Comté, Camembert et Morbier, confiture",
        price: "5,50 €",
      },
      { name: "Tiramisu au café", price: "6 €" },
      { name: "Crème brûlée à la cassonade", price: "7 €" },
      { name: "Cheesecake citron & spéculoos", price: "7 €" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Les boissons                                                       */
/* ------------------------------------------------------------------ */

export const happyHour = {
  title: "Happy hour",
  schedule: "Tous les jours de 16h à 22h",
  groups: [
    {
      label: "Pintes de bières",
      items: ["Mutzig 5 €", "Blanche 7,70 €", "Cuvée 7,50 €"],
    },
    {
      label: "Cocktails à 7,50 €",
      items: ["Moscow Mule", "Gin Tonic", "Caipirinha", "Aperol Spritz", "Cuba Libre"],
    },
  ],
};

export const cocktails: MenuSection[] = [
  {
    title: "Cocktails",
    items: [
      { name: "Gin Tonic", desc: "Gin 4 cl, tonic, rondelle de citron", price: "8 €" },
      { name: "Piña Colada", desc: "Rhum 4 cl, ananas, crème de coco", price: "8 €" },
      { name: "Cuba Libre", desc: "Rhum 4 cl, citron vert, coca", price: "8 €" },
      { name: "Moscow Mule", desc: "Vodka 4 cl, jus de citron, ginger beer", price: "9 €" },
      {
        name: "Spritz Aperol / Campari",
        desc: "Aperol 6 cl ou Campari 6 cl, vin blanc pétillant 8 cl, eau gazeuse",
        price: "9 €",
      },
      {
        name: "Mojito",
        desc: "Rhum 6 cl, menthe fraîche, citron vert, sucre de canne",
        price: "9 €",
      },
      {
        name: "Sex on the Beach",
        desc: "Vodka 4 cl, sirop de pêche, jus d’orange, jus de cranberry",
        price: "9 €",
      },
      {
        name: "Hibiscus",
        desc: "Fleur d’hibiscus, vodka 4 cl, citron vert, limonade",
        price: "9 €",
      },
      {
        name: "Cosmopolitan",
        desc: "Vodka 4 cl, Cointreau, jus de cranberry, jus de citron vert",
        price: "9 €",
      },
      {
        name: "Caipirinha",
        desc: "Cachaça, citron vert, sucre de canne, glace pilée",
        price: "9 €",
      },
      {
        name: "Punch",
        desc: "Rhum 6 cl, jus d’orange, jus d’ananas, jus de passion, sirop de grenadine, citron vert",
        price: "9 €",
      },
      { name: "T-Punch", desc: "Rhum agricole, citron vert, sucre de canne", price: "9 €" },
      {
        name: "Margarita",
        desc: "Tequila 5 cl, Cointreau 2 cl, jus de citron vert",
        price: "10 €",
      },
      { name: "Negroni", desc: "Gin 3 cl, vermouth rouge 3 cl, Campari 3 cl", price: "10 €" },
      {
        name: "Espresso Martini",
        desc: "Vodka 4 cl, liqueur de café, shot d’expresso, sucre de canne",
        price: "10 €",
      },
      {
        name: "Spritz Saint-Germain",
        desc: "Saint-Germain 6 cl, vin blanc pétillant 8 cl, eau gazeuse",
        price: "11 €",
      },
      {
        name: "Spritz Lemoncello",
        desc: "Lemoncello 6 cl, vin blanc pétillant 8 cl, eau gazeuse",
        price: "11 €",
      },
      {
        name: "Amaretto Sour",
        desc: "Amaretto, jus de citron, sirop de sucre, blanc d’œuf (optionnel)",
        price: "11 €",
      },
      {
        name: "Mai Tai",
        desc: "Rhum blanc 4 cl, rhum ambré 2 cl, Cointreau 2 cl, sirop d’orgeat, jus de citron vert",
        price: "11 €",
      },
      {
        name: "Pornstar Martini",
        desc: "Vodka 4 cl, liqueur fruits de la passion, jus de passion, jus de citron vert, sirop de vanille, shot de prosecco",
        price: "12 €",
      },
    ],
  },
  {
    title: "Cocktails sans alcool",
    items: [
      { name: "Virgin Fruit", desc: "Orange, ananas, pamplemousse, grenadine", price: "6 €" },
      {
        name: "Marbella Beach",
        desc: "Orange, ananas, cranberry, sirop de grenadine, citron vert",
        price: "6 €",
      },
      {
        name: "Virgin Mojito",
        desc: "Limonade, menthe fraîche, citron vert, sucre de canne",
        price: "7 €",
      },
      { name: "Virgin Colada", desc: "Jus d’orange, jus d’ananas, lait de coco", price: "7 €" },
      {
        name: "Apple Fraise",
        desc: "Jus de pomme, fraises, jus de citron, sirop de fraise, eau gazeuse",
        price: "7 €",
      },
      { name: "Virgin Hibiscus", desc: "Fleur d’hibiscus, limonade, citron vert", price: "8 €" },
    ],
  },
];

export const wines: MenuSection[] = [
  {
    title: "Sélection maison à la verse",
    subtitle: "Rouge, blanc ou rosé",
    items: [
      { name: "Verre de 14 cl", price: "4 €" },
      { name: "Verre de 25 cl", price: "6,50 €" },
      { name: "Pichet de 50 cl", price: "11 €" },
      { name: "Pichet d’1 L", price: "20 €" },
    ],
  },
  {
    title: "Vins blancs",
    subtitle: "Verre / bouteille",
    items: [
      { name: "Chardonnay Le Coquiller", desc: "IGP Val de Loire", price: "6 € / 28 €" },
      { name: "Côtes de Gascogne moelleux", desc: "IGP", price: "6 € / 28 €" },
      { name: "La Chablisienne « Vibrant »", desc: "Petit Chablis AOP", price: "9 € / 35 €" },
    ],
  },
  {
    title: "Vins rouges",
    subtitle: "Verre / bouteille",
    items: [
      { name: "Margeran", desc: "Côtes du Rhône AOP", price: "6 € / 28 €" },
      { name: "Les Mercadières", desc: "Bordeaux AOP", price: "7 € / 30 €" },
      { name: "André Vonnier", desc: "Brouilly AOP", price: "7 € / 30 €" },
      { name: "Saint-Nicolas-de-Bourgueil", price: "7 € / 30 €" },
      {
        name: "Sirus Château Croix Martelle",
        desc: "Minervois bio",
        price: "8 € / 32 €",
      },
      { name: "Gérard Bertrand", desc: "Pic Saint-Loup AOP 2019", price: "9 € / 35 €" },
    ],
  },
  {
    title: "Vins rosés",
    subtitle: "Verre / bouteille",
    items: [
      { name: "Valadadas", desc: "Côtes de Provence AOP", price: "6 € / 28 €" },
      { name: "Gris Blanc", desc: "Gérard Bertrand", price: "7 € / 30 €" },
    ],
  },
  {
    title: "Champagne",
    items: [
      { name: "Sélection maison", price: "69 €" },
      { name: "Moët & Chandon", price: "115 €" },
    ],
  },
];

export const beers: MenuSection[] = [
  {
    title: "Bières pression",
    subtitle: "25 cl / 50 cl",
    items: [
      { name: "Mutzig", price: "4 € / 8 €" },
      { name: "Affligem Blanche", price: "6 € / 9,50 €" },
      { name: "IPA", price: "6 € / 9,50 €" },
      { name: "Cuvée des Trolls", price: "6,50 € / 9,70 €" },
    ],
  },
  {
    title: "Bières bouteilles",
    subtitle: "33 cl",
    items: [
      { name: "Bière sans alcool", price: "5 €" },
      { name: "Heineken", price: "5,50 €" },
      { name: "Desperados", price: "6,50 €" },
      { name: "Corona", price: "6,50 €" },
    ],
  },
];

/** Apéritifs et whiskies : les alcools servis au verre, hors bière et vin. */
export const spirits: MenuSection[] = [
  {
    title: "Apéritifs",
    items: [
      { name: "Ricard – Pastis", desc: "2 cl", price: "4 €" },
      { name: "Muscat de Rivesaltes", desc: "10 cl", price: "5 €" },
      { name: "Cidre bio", desc: "33 cl", price: "5 €" },
      { name: "Kir au Chardonnay", desc: "12 cl", price: "6 €" },
      { name: "Porto – Campari", desc: "6 cl", price: "6 €" },
      { name: "Martini", desc: "6 cl", price: "6 €" },
      { name: "Prosecco", desc: "10 cl", price: "8 €" },
      { name: "Coupe de champagne", desc: "12 cl", price: "10 €" },
      { name: "Kir Royal", desc: "12 cl", price: "11 €" },
    ],
  },
  {
    title: "Whiskies",
    subtitle: "4 cl",
    items: [
      { name: "J&B", price: "7 €" },
      { name: "Jack Daniel’s", price: "9 €" },
      { name: "Monkey Shoulder", price: "10 €" },
      { name: "Chivas", price: "10 €" },
      { name: "Nikka japonais", price: "11 €" },
    ],
  },
];

export const softDrinks: MenuSection[] = [
  {
    title: "Cafétéria",
    items: [
      { name: "Café – Déca", price: "2,70 €" },
      { name: "Café allongé", price: "2,90 €" },
      { name: "Café noisette", price: "2,90 €" },
      { name: "Café crème", price: "4,50 €" },
      { name: "Cappuccino", price: "4,50 €" },
      { name: "Chocolat", price: "4,90 €" },
      { name: "Café double", price: "5 €" },
      { name: "Thé – Infusion", desc: "Dammann", price: "5 €" },
    ],
  },
  {
    title: "Soft",
    items: [
      { name: "Jus de fruits", price: "4,50 €" },
      { name: "Limonade artisanale", price: "4,50 €" },
      { name: "Ginger beer", price: "4,50 €" },
      { name: "Fuze Tea", price: "5 €" },
      { name: "Coca-Cola", price: "5 €" },
      { name: "Perrier", price: "5 €" },
      { name: "Orangina", price: "5 €" },
      { name: "Jus d’orange ou citron pressés", price: "6 €" },
    ],
  },
  {
    title: "Eaux minérales",
    subtitle: "50 cl / 1 L",
    items: [
      { name: "Vittel", price: "4 € / 6,50 €" },
      { name: "San Pellegrino", price: "4 € / 6,50 €" },
    ],
  },
];

export const snacks: MenuSection = {
  title: "Sur le pouce",
  items: [
    { name: "Assiette de frites maison", desc: "Supplément cheddar + 2 €", price: "7 €" },
    { name: "Planche de fromages", price: "16,50 €" },
    { name: "Planche de charcuteries", price: "18,50 €" },
    { name: "Planche mixte", desc: "Charcuteries & fromages", price: "20 €" },
  ],
};

/** Quelques signatures mises en avant sur la page d'accueil. */
export const signatures: MenuItem[] = [
  { name: "Œufs mayonnaise", desc: "Le classique du bouillon", price: "3,90 €" },
  { name: "Soupe à l’oignon gratinée", desc: "Gratinée au comté", price: "6 €" },
  { name: "Bœuf bourguignon", desc: "Mijoté, coquillettes", price: "13,50 €" },
  { name: "Confit de canard", desc: "Pommes grenailles", price: "16 €" },
  { name: "Crème brûlée", desc: "À la cassonade", price: "7 €" },
];
