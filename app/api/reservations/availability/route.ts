import { NextResponse } from "next/server";
import {
  MAX_COVERS_PER_SLOT,
  isSlotInPast,
  isValidIsoDate,
  slotToUtc,
  slotsForDate,
} from "@/lib/reservation";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Disponibilité d'une journée.
 *
 * Ne renvoie que des compteurs de couverts - jamais le contenu des
 * réservations. C'est la différence avec une lecture directe depuis le
 * navigateur, qui exposerait les coordonnées des clients.
 */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";

  if (!isValidIsoDate(date)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const slots = slotsForDate(date);
  if (slots.length === 0) {
    return NextResponse.json({ date, closed: true, slots: [] });
  }

  const base = slots.map((time) => ({
    time,
    seatsLeft: MAX_COVERS_PER_SLOT,
    past: isSlotInPast(date, time),
  }));

  const supabase = getSupabase();
  if (!supabase.configured) {
    // Sans configuration, on affiche les créneaux plutôt que d'échouer :
    // c'est la soumission qui renverra une erreur explicite.
    return NextResponse.json({ date, closed: false, slots: base, degraded: true });
  }

  const from = slotToUtc(date, slots[0]);
  const to = slotToUtc(date, slots[slots.length - 1]);
  to.setMinutes(to.getMinutes() + 1);

  const { data, error } = await supabase.client
    .from("reservations")
    .select("date, guests")
    .eq("business_id", supabase.businessId)
    .eq("status", "scheduled")
    .gte("date", from.toISOString())
    .lte("date", to.toISOString());

  if (error) {
    console.error("[reservations] lecture des disponibilités :", error.message);
    return NextResponse.json({ date, closed: false, slots: base, degraded: true });
  }

  const booked = new Map<string, number>();
  for (const row of (data ?? []) as { date: string; guests: number | null }[]) {
    const time = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(row.date));
    booked.set(time, (booked.get(time) ?? 0) + (row.guests ?? 1));
  }

  return NextResponse.json({
    date,
    closed: false,
    slots: base.map((s) => ({
      ...s,
      seatsLeft: Math.max(0, MAX_COVERS_PER_SLOT - (booked.get(s.time) ?? 0)),
    })),
  });
}
