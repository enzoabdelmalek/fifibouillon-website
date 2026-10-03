import {
  parisDateTimeToUtc, slotToUtc, slotsForDate, groupSlots, validateReservation,
  todayInParis, lastBookableDate, linkState, isUuid, firstNameOf, LINK_GRACE_HOURS,
  composeMessage, isGroupRequest, GROUP_SENTINEL, MAX_GUESTS_REQUEST,
} from "@/lib/reservation.ts";
import { clientIp, rateLimit, resetRateLimits } from "@/lib/rate-limit.ts";
import { renderMarkdown } from "@/lib/markdown.ts";
import {
  validatePrivatisation, composeRequest, MIN_GUESTS, MAX_GUESTS,
} from "@/lib/privatisation.ts";

let fails = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`  ${ok ? "✓" : "✗"} ${label}${ok ? "" : `\n      obtenu ${JSON.stringify(got)}\n      attendu ${JSON.stringify(want)}`}`);
};

console.log("\n- Fuseau horaire (le piège : serveur en UTC, restaurant à Paris) -");
eq("20h00 le 15 janvier (heure d'hiver, UTC+1)",
   parisDateTimeToUtc("2027-01-15", "20:00").toISOString(), "2027-01-15T19:00:00.000Z");
eq("20h00 le 15 juillet (heure d'été, UTC+2)",
   parisDateTimeToUtc("2027-07-15", "20:00").toISOString(), "2027-07-15T18:00:00.000Z");
eq("veille du passage à l'heure d'été",
   parisDateTimeToUtc("2027-03-27", "20:00").toISOString(), "2027-03-27T19:00:00.000Z");
eq("lendemain du passage à l'heure d'été",
   parisDateTimeToUtc("2027-03-29", "20:00").toISOString(), "2027-03-29T18:00:00.000Z");

console.log("\n- Créneaux dérivés des horaires de lib/site.ts -");
const lundi = slotsForDate("2027-01-11");   // lundi, 11h00–00h00
const samedi = slotsForDate("2027-01-16");  // samedi, 11h00–02h00
const dimanche = slotsForDate("2027-01-17");// dimanche : FERMÉ
eq("lundi : premier créneau", lundi[0], "11:00");
eq("lundi : dernier créneau, 1h30 avant la fermeture à minuit", lundi.at(-1), "22:30");
eq("samedi : dernier créneau, 1h30 avant la fermeture à 2h", samedi.at(-1), "00:30");
/*
 * Le dimanche est FERMÉ. Ce test garde la fermeture plutôt que l'horaire :
 * il échouera si quelqu'un remet un dimanche dans `site.hours`, et un
 * dimanche réservable est un service non assuré que personne ne découvre
 * avant que le client se présente devant une porte close.
 */
eq("dimanche : aucun créneau, la salle est fermée", dimanche.length, 0);
eq("pas de trou entre les créneaux (service continu)",
   lundi.length, 24);
// Le week-end ferme deux heures plus tard, soit quatre créneaux de plus.
eq("le week-end ajoute quatre créneaux",
   samedi.length - lundi.length, 4);
eq("groupes de lecture", groupSlots(lundi).map(g => g.label), ["Déjeuner", "Après-midi", "Dîner"]);
eq("aucun créneau perdu au regroupement",
   groupSlots(samedi).reduce((n, g) => n + g.slots.length, 0), samedi.length);
eq("les créneaux d'après minuit restent au dîner",
   groupSlots(samedi).at(-1).slots.slice(-3), ["23:30", "00:00", "00:30"]);

// Le bug que les horaires réels ont révélé : « samedi, 01:00 » désigne la nuit
// de samedi à dimanche. Converti naïvement, il partait vingt-quatre heures
// trop tôt - la table aurait été réservée pour le petit matin du samedi.
console.log("\n- Créneaux après minuit : le bon jour -");
eq("samedi 20h00 reste le samedi",
   slotToUtc("2027-01-16", "20:00").toISOString(), "2027-01-16T19:00:00.000Z");
eq("samedi 01:00 bascule au dimanche",
   slotToUtc("2027-01-16", "01:00").toISOString(), "2027-01-17T00:00:00.000Z");
eq("samedi 00:30 bascule au dimanche",
   slotToUtc("2027-01-16", "00:30").toISOString(), "2027-01-16T23:30:00.000Z");
eq("lundi 23:00 ne bascule pas",
   slotToUtc("2027-01-11", "23:00").toISOString(), "2027-01-11T22:00:00.000Z");
eq("la bascule franchit aussi le changement de mois",
   slotToUtc("2027-01-30", "01:00").toISOString(), "2027-01-31T00:00:00.000Z");

console.log("\n- Validation (rejouée côté serveur) -");
// Dates calculées à partir d'aujourd'hui : une date codée en dur finirait
// par sortir de l'horizon de réservation et ferait échouer le test.
const nextWeekday = (target) => {
  const [y, m, d] = todayInParis().split("-").map(Number);
  for (let i = 1; i <= 14; i++) {
    const probe = new Date(Date.UTC(y, m - 1, d + i));
    if (probe.getUTCDay() === target) return probe.toISOString().slice(0, 10);
  }
  throw new Error("introuvable");
};
const lundiProchain = nextWeekday(1);
const dimancheProchain = nextWeekday(0);
const samediProchain = nextWeekday(6);

const base = { name: "Jean Dupont", phone: "06 12 34 56 78", email: "jean@exemple.fr",
               date: lundiProchain, time: "20:00", guests: 4 };
eq("réservation valide", validateReservation(base), null);
eq("nom vide", !!validateReservation({ ...base, name: "" }), true);
eq("téléphone trop court", !!validateReservation({ ...base, phone: "0612" }), true);
eq("e-mail invalide", !!validateReservation({ ...base, email: "jean@" }), true);
eq("date passée", !!validateReservation({ ...base, date: "2020-01-01" }), true);
eq("au-delà de l'horizon", !!validateReservation({ ...base, date: "2099-01-01" }), true);
// Au-delà de 10, la réservation devient une demande : acceptée, mais le
// nombre exact est obligatoire — « plus de 10 » ne dresse pas une table.
eq("le choix « plus de 10 » seul est refusé",
   !!validateReservation({ ...base, guests: GROUP_SENTINEL }), true);
eq("14 convives acceptés comme demande",
   validateReservation({ ...base, guests: 14 }), null);
eq(`au-delà de ${MAX_GUESTS_REQUEST}, c'est une privatisation`,
   !!validateReservation({ ...base, guests: MAX_GUESTS_REQUEST + 1 }), true);
eq(`${MAX_GUESTS_REQUEST} pile reste accepté`,
   validateReservation({ ...base, guests: MAX_GUESTS_REQUEST }), null);
eq("10 n'est pas une demande de groupe", isGroupRequest(10), false);
eq("11 en est une", isGroupRequest(11), true);
eq("0 convive", !!validateReservation({ ...base, guests: 0 }), true);
eq("horaire hors service (10h)", !!validateReservation({ ...base, time: "10:00" }), true);
// Le dimanche ferme à minuit, le samedi à 2h : un même horaire est accepté
// un jour et refusé l'autre. C'est le cœur de la règle, il faut les deux.
eq("dimanche : 1h du matin refusé (fermé)",
   !!validateReservation({ ...base, date: dimancheProchain, time: "01:00" }), true);
eq("00h30 accepté le samedi, dernier créneau",
   validateReservation({ ...base, date: samediProchain, time: "00:30" }), null);
// La salle ferme à 2h, mais on ne prend plus de table après 00h30 : c'est la
// règle du dernier service qui coupe ici, pas l'horaire d'ouverture.
eq("1h du matin refusé même le samedi",
   !!validateReservation({ ...base, date: samediProchain, time: "01:00" }), true);
// Le dimanche, AUCUN horaire ne passe — pas même celui qui marchait avant.
eq("dimanche : 22h30 refusé lui aussi (fermé)",
   !!validateReservation({ ...base, date: dimancheProchain, time: "22:30" }), true);
eq("dimanche : 23h refusé",
   !!validateReservation({ ...base, date: dimancheProchain, time: "23:00" }), true);

// Le jeudi monte maintenant à 2h, comme le vendredi et le samedi.
const jeudiProchain = nextWeekday(4);
eq("jeudi : 00h30 accepté, la fermeture est passée à 2h",
   validateReservation({ ...base, date: jeudiProchain, time: "00:30" }), null);
eq("jeudi : 1h du matin refusé, trop près de la fermeture",
   !!validateReservation({ ...base, date: jeudiProchain, time: "01:00" }), true);
eq("message trop long", !!validateReservation({ ...base, message: "x".repeat(501) }), true);

console.log("\n- Bornes du sélecteur de date -");
eq("min = aujourd'hui", /^\d{4}-\d{2}-\d{2}$/.test(todayInParis()), true);
eq("max > min", lastBookableDate() > todayInParis(), true);

console.log("\n- Limitation de débit -");
resetRateLimits();
const verdicts = Array.from({ length: 4 }, () => rateLimit("t", 3, 60_000));
eq("les 3 premières passent", verdicts.slice(0, 3).map(v => v.allowed), [true, true, true]);
eq("la 4e est refusée", verdicts[3].allowed, false);
eq("elle indique combien de temps attendre", verdicts[3].retryAfter > 0, true);
resetRateLimits();
eq("une autre clé a son propre compteur",
   [rateLimit("a", 1, 60_000).allowed, rateLimit("b", 1, 60_000).allowed], [true, true]);
resetRateLimits();
eq("la fenêtre écoulée remet le compteur à zéro",
   [rateLimit("c", 1, 1).allowed, (Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5), rateLimit("c", 1, 1).allowed)],
   [true, true]);
// Derrière un proxy, c'est la PREMIÈRE adresse qui est celle du client :
// prendre la dernière limiterait le proxy, donc tous ses visiteurs d'un coup.
const req = (h) => new Request("https://x.fr", { headers: h });
eq("adresse du client derrière un proxy",
   clientIp(req({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" })), "203.0.113.7");
eq("repli sur x-real-ip", clientIp(req({ "x-real-ip": "203.0.113.9" })), "203.0.113.9");
eq("aucune adresse fournie", clientIp(req({})), "inconnue");

console.log("\n- Rendu Markdown des articles -");
const md = (src) => renderMarkdown(src);
// Le contenu vient de la base : tout doit être échappé avant d'être rendu.
eq("une balise script est neutralisée",
   md("<script>alert(1)</script>").includes("<script>"), false);
eq("elle apparaît en texte", md("<script>alert(1)</script>").includes("&lt;script&gt;"), true);
eq("un gestionnaire d'événement ne produit pas de balise",
   md('<img src=x onerror="alert(1)">').includes("<img"), false);
eq("un lien javascript: n'est pas transformé en lien",
   md("[clic](javascript:alert(1))").includes("<a "), false);
eq("un lien http est autorisé et s'ouvre ailleurs",
   md("[VWA](https://vibewebagency.fr)").includes('target="_blank"'), true);
eq("un lien interne reste dans l'onglet",
   md("[la carte](/la-carte)").includes('target="_blank"'), false);
eq("titre de niveau 2", md("## Le bouillon").includes("<h2"), true);
eq("liste à puces", md("- un\n- deux").match(/<li>/g).length, 2);
eq("citation", md("> Bien manger").includes("<blockquote"), true);
eq("gras", md("du **vrai** fait maison").includes("<strong"), true);
eq("les paragraphes sont séparés", md("un\n\ndeux").match(/<p /g).length, 2);
eq("une apostrophe typographique passe sans dommage",
   md("l'équipe").includes("l'équipe"), true);

console.log("\n- Message enregistré -");
// Composé côté serveur : c'est la seule version qui fasse foi. Un navigateur
// modifié ne peut pas faire passer un groupe pour une table de deux.
const msg = (o) => composeMessage({ ...base, ...o });
eq("rien à signaler → pas de message", msg({ guests: 4 }), null);
eq("préférence salle", msg({ guests: 4, seating: "indoor" }), "Préférence : en salle");
eq("préférence terrasse", msg({ guests: 4, seating: "terrace" }), "Préférence : en terrasse");
// « Indifférent » est le cas par défaut : l'écrire dans le message
// n'apprendrait rien au restaurant et le rendrait moins lisible.
eq("indifférent ne produit rien", msg({ guests: 4, seating: "any" }), null);
eq("un groupe est signalé en tête",
   msg({ guests: 14 }).startsWith("⚠️ DEMANDE DE GROUPE — 14 convives"), true);
eq("le message du client vient en dernier",
   msg({ guests: 14, seating: "terrace", message: "Anniversaire" }).split("\n"),
   ["⚠️ DEMANDE DE GROUPE — 14 convives, à confirmer", "Préférence : en terrasse", "Anniversaire"]);

console.log("\n- Lien de suivi d'une réservation -");
const T = (iso) => new Date(iso).getTime();
const RDV = "2027-01-15T19:00:00.000Z";
eq("avant le service : consultable et annulable",
   linkState(RDV, "scheduled", T("2027-01-15T12:00:00Z")), { expired: false, cancelled: false, cancellable: true });
eq("quinze minutes avant : encore annulable",
   linkState(RDV, "scheduled", T("2027-01-15T18:45:00Z")).cancellable, true);
// L'heure passée, la table est dressée : on consulte encore, on n'annule plus.
eq("pendant le service : consultable, plus annulable",
   linkState(RDV, "scheduled", T("2027-01-15T20:00:00Z")), { expired: false, cancelled: false, cancellable: false });
eq(`après ${LINK_GRACE_HOURS}h, le lien est mort`,
   linkState(RDV, "scheduled", T("2027-01-15T22:01:00Z")).expired, true);
eq("juste avant l'expiration, il vit encore",
   linkState(RDV, "scheduled", T("2027-01-15T21:59:00Z")).expired, false);
eq("une réservation annulée ne se ré-annule pas",
   linkState(RDV, "cancelled", T("2027-01-15T12:00:00Z")), { expired: false, cancelled: true, cancellable: false });

eq("un UUID est accepté", isUuid("11111111-2222-3333-4444-555555555555"), true);
eq("une chaîne quelconque est refusée", isUuid("nawak"), false);
eq("un UUID tronqué est refusé", isUuid("11111111-2222-3333-4444-55555555555"), false);
// La page n'affiche que le prénom : ni nom de famille, ni téléphone, ni e-mail.
eq("prénom seul", firstNameOf("Marie Dupont"), "Marie");
eq("nom composé", firstNameOf("  Jean-Pierre  Martin "), "Jean-Pierre");
eq("nom absent", firstNameOf(null), "");

console.log("\n- Demande de privatisation -");
const demain = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); })();
const priva = (o) => validatePrivatisation({
  name: "Jean Dupont", email: "jean@exemple.fr", phone: "0612345678",
  guests: 25, eventType: "anniversaire", ...o,
});
eq("demande valide", priva({}), null);
// En dessous du seuil, une table suffit : on ne veut pas bloquer une salle
// pour douze personnes qui pouvaient simplement réserver.
eq(`moins de ${MIN_GUESTS} personnes refusé`, !!priva({ guests: MIN_GUESTS - 1 }), true);
eq(`${MIN_GUESTS} pile accepté`, priva({ guests: MIN_GUESTS }), null);
eq(`au-delà de ${MAX_GUESTS}, on renvoie au téléphone`, !!priva({ guests: MAX_GUESTS + 1 }), true);
// Le téléphone est obligatoire ici, contrairement à une réservation : une
// privatisation se cale de vive voix.
eq("téléphone obligatoire", !!priva({ phone: "" }), true);
eq("type d'événement inconnu refusé", !!priva({ eventType: "soiree-mousse" }), true);
// La date est facultative, mais si elle est donnée elle doit tenir debout.
eq("sans date, c'est accepté", priva({ date: undefined }), null);
eq("date passée refusée", !!priva({ date: "2020-01-01" }), true);
eq("date future acceptée", priva({ date: demain }), null);

const recap = (o) => composeRequest({
  name: "Jean", email: "j@x.fr", phone: "0612345678",
  guests: 25, eventType: "anniversaire", ...o,
});
eq("le récapitulatif annonce l'événement et le nombre",
   recap({}).split("\n").slice(0, 2), ["Privatisation - Anniversaire", "25 personnes"]);
eq("sans date, on le dit plutôt que de se taire",
   recap({}).includes("Date non arrêtée"), true);
eq("le message du client vient après une ligne vide",
   recap({ message: "Salle au calme" }).endsWith("\n\nSalle au calme"), true);

console.log(fails === 0 ? "\n✅ tout passe\n" : `\n❌ ${fails} échec(s)\n`);
process.exit(fails ? 1 : 0);
