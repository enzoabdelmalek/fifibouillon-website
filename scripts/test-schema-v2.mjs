/**
 * Le site parle-t-il vraiment le schéma v2 ?
 *
 *   npm run test:schema
 *
 * ─── POURQUOI CE TEST EXISTE ─────────────────────────────────────────────
 *
 * Une colonne mal nommée ne casse pas le site : PostgREST répond, et la
 * panne est silencieuse. `status = 'scheduled'` sur la v2 ne lève aucune
 * erreur — il rend zéro ligne, donc tous les créneaux paraissent libres et
 * FiFi découvre la surréservation un samedi soir. Un `insert` sur une
 * colonne disparue, lui, perd la demande d'un client sans que personne ne
 * le sache.
 *
 * ─── CE QUE CE TEST PROUVE, ET CE QU'IL NE PROUVE PAS ────────────────────
 *
 * Il lit le SQL de migration du dashboard — la source du schéma — et vérifie
 * que chaque colonne citée par ce site y existe, et que chaque littéral de
 * statut passe la contrainte CHECK.
 *
 * Il ne remplace PAS un aller-retour sur la base : il ne dit rien des RLS,
 * ni du fait que la ligne arrive effectivement. Ça, il faut l'essayer en
 * dev avant de basculer.
 *
 * Et s'il ne trouve pas le SQL, il ÉCHOUE. Un test qui se tait quand il n'a
 * rien à lire est un test vert qui ne prouve rien — c'est exactement l'état
 * dans lequel le site est tombé en v1.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = resolve(ICI, "../../../../VWA-Utils/dashboard/supabase/migrations");

let sql;
try {
  sql = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS, f), "utf8"))
    .join("\n");
} catch (e) {
  console.error(`❌ Schéma introuvable dans ${MIGRATIONS}`);
  console.error(`   ${e.message}`);
  console.error("   Ce test ne peut rien vérifier : il échoue plutôt que de passer pour vert.");
  process.exit(1);
}

let ok = 0, ko = 0;
const check = (t, c, d = "") => { c ? ok++ : ko++; console.log(`  ${c ? "✓" : "✗"} ${t}${c ? "" : "  → " + d}`); };

/** Le corps d'un `create table <nom> (…)`. */
function corpsDeTable(nom) {
  const i = sql.search(new RegExp(`^create table ${nom} \\(`, "m"));
  if (i === -1) return null;
  const fin = sql.indexOf("\n);", i);
  return fin === -1 ? null : sql.slice(i, fin);
}

/** Les colonnes déclarées, hors contraintes de table. */
function colonnes(corps) {
  return new Set(
    corps.split("\n").slice(1)
      .map((l) => l.trim().match(/^([a-z_][a-z0-9_]*)\s+[a-z]/)?.[1])
      .filter(Boolean)
      .filter((c) => !["foreign", "check", "unique", "primary", "constraint"].includes(c)),
  );
}

/** Les valeurs autorisées par `check (<colonne> in (…))`. */
function valeursAutorisees(corps, colonne) {
  const m = corps.match(new RegExp(`check \\(${colonne} in \\(([^)]*)\\)`));
  return m ? new Set(m[1].split(",").map((v) => v.trim().replace(/^'|'$/g, ""))) : null;
}

/*
 * Ce que le site écrit et lit. Tenu à la main EXPRÈS : si quelqu'un modifie
 * une route sans toucher cette liste, le test reste vert et ne sert à rien.
 * C'est la limite connue de ce fichier — la vraie garde est le typage de
 * `lib/supabase.ts`, que `tsc` vérifie, et ceci en est le filet.
 */
const ATTENDU = {
  reservations: {
    colonnes: ["business_id", "customer_id", "guest_name", "starts_at", "party_size",
               "customer_message", "status", "source", "cancelled_at"],
    statuts: { status: ["confirmed", "cancelled"], source: ["website"] },
  },
  quotes: {
    colonnes: ["business_id", "customer_id", "status", "title",
               "request_message", "request_details"],
    statuts: { status: ["request"] },
  },
  customers: {
    colonnes: ["business_id", "full_name", "email", "phone", "source"],
    statuts: { source: ["reservation", "quote", "form"] },
  },
  blog_posts: {
    colonnes: ["business_id", "slug", "title", "tags", "excerpt", "content",
               "cover_url", "status", "published_at", "created_at"],
    statuts: { status: ["published"] },
  },
};

for (const [table, attendu] of Object.entries(ATTENDU)) {
  console.log(`\n— ${table}`);
  const corps = corpsDeTable(table);
  if (!corps) { check("la table existe en v2", false, "introuvable dans le SQL"); continue; }
  check("la table existe en v2", true);

  const presentes = colonnes(corps);
  for (const c of attendu.colonnes) {
    check(`colonne ${c}`, presentes.has(c), "absente du schéma v2");
  }

  for (const [colonne, valeurs] of Object.entries(attendu.statuts ?? {})) {
    const permises = valeursAutorisees(corps, colonne);
    if (!permises) { check(`contrainte sur ${colonne}`, false, "aucun check trouvé"); continue; }
    for (const v of valeurs) {
      check(`${colonne} = '${v}'`, permises.has(v),
        `refusé ; permis : ${[...permises].join(", ")}`);
    }
  }
}

/*
 * Le piège inverse, et c'est celui qui coûte cher : une valeur de la v1 qui
 * n'existe plus. Elle ne fait PAS échouer une requête de lecture, elle rend
 * zéro ligne.
 */
console.log("\n— Les valeurs de la v1 ne doivent plus passer");
{
  const corps = corpsDeTable("reservations");
  const permises = valeursAutorisees(corps, "status");
  check("'scheduled' n'existe plus", !permises.has("scheduled"),
    "il existe encore : ce test ne protège de rien");
  check("'cancelled' et 'no_show' libèrent la table",
    permises.has("cancelled") && permises.has("no_show"));
}

console.log(`\n${ko === 0 ? "✅" : "❌"} ${ok} vrais, ${ko} faux\n`);
process.exit(ko === 0 ? 0 : 1);
