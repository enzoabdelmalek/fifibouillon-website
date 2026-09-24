import {
  parisDateTimeToUtc, slotToUtc, slotsForDate, groupSlots, validateReservation,
  todayInParis, lastBookableDate,
} from "@/lib/reservation.ts";

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
const dimanche = slotsForDate("2027-01-17");// dimanche, 11h00–00h00
eq("lundi : premier créneau", lundi[0], "11:00");
eq("lundi : dernier créneau (1h avant fermeture à minuit)", lundi.at(-1), "23:00");
eq("samedi : dernier créneau (fermeture à 2h)", samedi.at(-1), "01:00");
eq("dimanche : fermeture à minuit comme en semaine", dimanche.at(-1), "23:00");
eq("pas de trou entre les créneaux (service continu)",
   lundi.length, 25);
eq("le week-end ajoute les quatre créneaux d'après minuit",
   samedi.length - lundi.length, 4);
eq("groupes de lecture", groupSlots(lundi).map(g => g.label), ["Déjeuner", "Après-midi", "Dîner"]);
eq("aucun créneau perdu au regroupement",
   groupSlots(samedi).reduce((n, g) => n + g.slots.length, 0), samedi.length);
eq("les créneaux d'après minuit restent au dîner",
   groupSlots(samedi).at(-1).slots.slice(-3), ["00:00", "00:30", "01:00"]);

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
eq("11 convives refusés en ligne", !!validateReservation({ ...base, guests: 11 }), true);
eq("0 convive", !!validateReservation({ ...base, guests: 0 }), true);
eq("horaire hors service (10h)", !!validateReservation({ ...base, time: "10:00" }), true);
// Le dimanche ferme à minuit, le samedi à 2h : un même horaire est accepté
// un jour et refusé l'autre. C'est le cœur de la règle, il faut les deux.
eq("1h du matin refusé le dimanche (fermeture à minuit)",
   !!validateReservation({ ...base, date: dimancheProchain, time: "01:00" }), true);
eq("1h du matin accepté le samedi (fermeture à 2h)",
   validateReservation({ ...base, date: samediProchain, time: "01:00" }), null);
eq("22h accepté le dimanche (le service va jusqu'à minuit)",
   validateReservation({ ...base, date: dimancheProchain, time: "22:00" }), null);
eq("message trop long", !!validateReservation({ ...base, message: "x".repeat(501) }), true);

console.log("\n- Bornes du sélecteur de date -");
eq("min = aujourd'hui", /^\d{4}-\d{2}-\d{2}$/.test(todayInParis()), true);
eq("max > min", lastBookableDate() > todayInParis(), true);

console.log(fails === 0 ? "\n✅ tout passe\n" : `\n❌ ${fails} échec(s)\n`);
process.exit(fails ? 1 : 0);
