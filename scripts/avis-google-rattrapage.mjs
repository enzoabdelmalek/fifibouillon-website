/**
 * Rattrapage : demande d'avis Google à toutes les réservations déjà passées.
 *
 *   npm run avis:rattrapage            # simulation - compte, n'envoie rien
 *   npm run avis:rattrapage -- --envoyer
 *   npm run avis:rattrapage -- --envoyer --lien-provisoire
 *   npm run avis:rattrapage -- --sauf-deja-relances   # voir plus bas
 *
 * À lancer une seule fois, depuis un poste, avec les variables de .env.local.
 *
 * Un client = un e-mail, même s'il a réservé dix fois : on garde sa dernière
 * réservation. Sa clé d'idempotence est la même que celle du cron, qui ne
 * renverra donc pas l'e-mail si les deux passent sur la même réservation.
 */
import { sendReviewRequest } from "@/lib/email.ts";
import { firstNameOf } from "@/lib/reservation.ts";
import { site } from "@/lib/site.ts";
import { getSupabase } from "@/lib/supabase.ts";

const envoyer = process.argv.includes("--envoyer");

// Le client ne recevra cet e-mail qu'une fois : avec le lien de recherche
// provisoire, ce serait une demande gâchée.
// `--lien-provisoire` passe outre, en connaissance de cause.
if (envoyer && site.googleReviewUrl.includes("google.com/search") && !process.argv.includes("--lien-provisoire")) {
  console.error("✗ site.googleReviewUrl est encore le lien provisoire. Mettre le lien de la fiche avant d'envoyer.");
  process.exit(1);
}

const supabase = getSupabase();
if (!supabase.configured) {
  console.error(`✗ variables manquantes : ${supabase.missing.join(", ")}`);
  process.exit(1);
}

// Le .env.local pointe sur la base de dev : afficher la cible avant tout.
const projet = new URL(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
console.log(`Base visée : ${projet} · business_id ${supabase.businessId}`);

const { data, error } = await supabase.client
  .from("reservations")
  .select("id, customer_name, customer_mail, date, status, attended")
  .eq("business_id", supabase.businessId)
  .in("status", ["scheduled", "attended"])
  .or("attended.is.null,attended.eq.true")
  .lte("date", new Date(Date.now() - 3 * 60 * 60_000).toISOString())
  .order("date", { ascending: false });

if (error) {
  console.error("✗ lecture :", error.message);
  process.exit(1);
}

/*
 * Le premier passage (09/10/2026) ne retenait que le statut « scheduled » et
 * a oublié les clients notés « attended ». `--sauf-deja-relances` écarte les
 * adresses déjà servies par ce passage : leur clé d'idempotence portait sur
 * une autre réservation, Resend ne bloquerait donc pas le doublon.
 */
const dejaRelances = new Set(
  process.argv.includes("--sauf-deja-relances")
    ? data
        .filter((r) => r.status === "scheduled" && r.attended !== false)
        .map((r) => r.customer_mail?.trim().toLowerCase())
        .filter(Boolean)
    : [],
);

const parClient = new Map();
let sansMail = 0;
for (const row of data) {
  const email = row.customer_mail?.trim().toLowerCase();
  if (!email) sansMail++;
  else if (!dejaRelances.has(email) && !parClient.has(email)) parClient.set(email, row); // tri décroissant : la première est la dernière
}

console.log(`${data.length} réservations passées, ${parClient.size} clients à relancer, ${dejaRelances.size} déjà relancés écartés, ${sansMail} sans e-mail.`);
if (!envoyer) {
  console.log("Simulation : rien n'est parti. Relancer avec --envoyer.");
  process.exit(0);
}

let sent = 0;
const failed = [];
for (const [email, row] of parClient) {
  if (await sendReviewRequest(row.id, email, firstNameOf(row.customer_name))) sent++;
  else failed.push(email);
  // Resend plafonne à quelques requêtes par seconde.
  await new Promise((r) => setTimeout(r, 600));
}
console.log(`✓ ${sent} envoyés, ${failed.length} en échec${failed.length ? ` : ${failed.join(", ")}` : ""}.`);
