import { Resend } from "resend";
import { env } from "@/lib/env";
import type { ReservationInput } from "@/lib/reservation";
import { site } from "@/lib/site";

/* Palette de la marque, en dur : un e-mail ne peut pas lire nos variables CSS. */
const BUTTER = "#fff8ca";
const PAPER = "#fffdf6";
const INK = "#2d120d";
const MUTED = "#7a544a";
const ROSEWOOD = "#6b0b0c";
const GOLD = "#8a6209";

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Échappe les données saisies par le visiteur avant de les injecter en HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(45,18,13,.12);color:${MUTED};font-size:14px;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(45,18,13,.12);color:${INK};font-size:15px;font-weight:600;text-align:right;">${value}</td>
  </tr>`;
}

function shell(title: string, intro: string, table: string, footer: string): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:${PAPER};border:1px solid rgba(45,18,13,.14);">
    <tr>
      <td style="background:${BUTTER};padding:32px 28px;text-align:center;border-bottom:2px solid ${ROSEWOOD};">
        <div style="font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:${ROSEWOOD};">${site.tagline}</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;color:${INK};margin-top:10px;letter-spacing:.02em;">FiFi</div>
        <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${GOLD};margin-top:8px;">${site.district} · ${site.city}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:400;color:${INK};">${esc(title)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${MUTED};">${intro}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BUTTER};padding:4px 18px;">${table}</table>
        ${footer}
      </td>
    </tr>
    <tr>
      <td style="background:${INK};padding:22px 28px;text-align:center;color:${BUTTER};font-size:12px;line-height:1.7;">
        ${site.address.street} · ${site.address.postalCode} ${site.address.city}<br>
        <a href="tel:${site.contact.phone.replace(/\s/g, "")}" style="color:${BUTTER};text-decoration:none;">${site.contact.phoneDisplay}</a>
      </td>
    </tr>
  </table>
</body></html>`;
}

export function customerTemplate(input: ReservationInput, reservationId: string | null = null): string {
  return shell(
    "Votre table est réservée",
    `Bonjour <strong style="color:${INK};">${esc(input.name)}</strong>, nous avons bien noté votre réservation et serons heureux de vous accueillir.`,
    [
      row("Date", formatDate(input.date)),
      row("Heure", input.time.replace(":", "h")),
      row("Convives", `${input.guests} ${input.guests > 1 ? "personnes" : "personne"}`),
      input.message ? row("Votre note", esc(input.message)) : "",
    ].join(""),
    `${
       reservationId
         ? `<p style="margin:24px 0 0;text-align:center;">
              <a href="${new URL(`/reserver/${reservationId}`, site.url).toString()}"
                 style="display:inline-block;background:${ROSEWOOD};color:${BUTTER};text-decoration:none;padding:14px 28px;border-radius:999px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;">
                Voir ou annuler ma réservation
              </a>
            </p>`
         : ""
     }
     <p style="margin:24px 0 0;font-size:14px;line-height:1.65;color:${MUTED};">
       Un empêchement ? Annulez depuis le lien ci-dessus, ou appelez-nous au
       <a href="tel:${site.contact.phone.replace(/\s/g, "")}" style="color:${ROSEWOOD};font-weight:600;text-decoration:none;">${site.contact.phoneDisplay}</a>,
       nous libérerons la table.
     </p>
     <p style="margin:18px 0 0;font-size:14px;line-height:1.65;color:${MUTED};">À très bientôt,<br><em>L’équipe FiFi</em></p>`,
  );
}

export function restaurantTemplate(input: ReservationInput): string {
  const tel = input.phone.replace(/\s/g, "");
  return shell(
    "Nouvelle réservation",
    `Réservation prise sur le site pour <strong style="color:${INK};">${esc(input.name)}</strong>.`,
    [
      row("Date", formatDate(input.date)),
      row("Heure", input.time.replace(":", "h")),
      row("Convives", String(input.guests)),
      row("Téléphone", `<a href="tel:${esc(tel)}" style="color:${ROSEWOOD};text-decoration:none;">${esc(input.phone)}</a>`),
      row("E-mail", `<a href="mailto:${esc(input.email)}" style="color:${ROSEWOOD};text-decoration:none;">${esc(input.email)}</a>`),
      input.message ? row("Note du client", esc(input.message)) : "",
    ].join(""),
    `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
       Cette réservation est également enregistrée dans le dashboard.
     </p>`,
  );
}

/**
 * Envoie l'accusé de réception au client et la notification au restaurant.
 *
 * Ne lève jamais : la table est déjà réservée quand cette fonction est
 * appelée. Un e-mail qui échoue ne doit pas transformer une réservation
 * valide en erreur affichée au visiteur.
 */
export async function sendReservationEmails(
  input: ReservationInput,
  reservationId: string | null = null,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = env.resendApiKey();
  const from = env.resendFrom();
  const adminMail = env.adminMail();

  const missing = [
    !apiKey && "RESEND_API_KEY",
    !from && "RESEND_FROM",
    !adminMail && "ADMIN_MAIL",
  ].filter(Boolean);

  if (missing.length) {
    console.error(`[reservations] e-mails non envoyés, variables manquantes : ${missing.join(", ")}`);
    return { sent: false, reason: "config" };
  }

  try {
    const resend = new Resend(apiKey);
    const date = formatDate(input.date);

    const [customer, restaurant] = await Promise.allSettled([
      resend.emails.send({
        from: from!,
        to: input.email,
        subject: `Votre table chez FiFi - ${date}`,
        html: customerTemplate(input, reservationId),
      }),
      resend.emails.send({
        from: from!,
        to: adminMail!,
        replyTo: input.email,
        subject: `Réservation - ${input.name}, ${input.guests} couv. le ${date} à ${input.time}`,
        html: restaurantTemplate(input),
      }),
    ]);

    for (const [who, result] of [
      ["client", customer],
      ["restaurant", restaurant],
    ] as const) {
      if (result.status === "rejected") {
        console.error(`[reservations] e-mail ${who} :`, result.reason);
      } else if (result.value.error) {
        console.error(`[reservations] e-mail ${who} :`, result.value.error.message);
      }
    }

    return { sent: customer.status === "fulfilled" && !customer.value.error };
  } catch (error) {
    console.error("[reservations] envoi des e-mails :", error);
    return { sent: false, reason: "send" };
  }
}
