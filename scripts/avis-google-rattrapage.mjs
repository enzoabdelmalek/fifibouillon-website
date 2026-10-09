/**
 * Rattrapage : demande d'avis Google à toutes les réservations déjà passées.
 *
 *   npm run avis:rattrapage            # simulation - compte, n'envoie rien
 *   npm run avis:rattrapage -- --envoyer
 *   npm run avis:rattrapage -- --envoyer --lien-provisoire
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

const { data, error } = await supabase.client
  .from("reservations")
  .select("id, customer_name, customer_mail, date")
  .eq("business_id", supabase.businessId)
  .eq("status", "scheduled")
  .or("attended.is.null,attended.eq.true")
  .lte("date", new Date(Date.now() - 3 * 60 * 60_000).toISOString())
  .order("date", { ascending: false });

if (error) {
  console.error("✗ lecture :", error.message);
  process.exit(1);
}

const parClient = new Map();
let sansMail = 0;
for (const row of data) {
  const email = row.customer_mail?.trim().toLowerCase();
  if (!email) sansMail++;
  else if (!parClient.has(email)) parClient.set(email, row); // tri décroissant : la première est la dernière
}

console.log(`${data.length} réservations passées, ${parClient.size} clients distincts, ${sansMail} sans e-mail.`);
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
