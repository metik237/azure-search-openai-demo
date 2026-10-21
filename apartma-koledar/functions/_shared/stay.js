// Helpers shared by the /api/stays routes. Files under _shared are not routes.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COLORS = 8;

export const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const validDate = (s) => typeof s === "string" && DATE_RE.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));
const clean = (s) => String(s).replace(/\s+/g, " ").trim();

// Returns a normalized stay, or null when the body is not acceptable.
export function parseStay(body) {
  if (!body || typeof body !== "object") return null;
  let { start, end } = body;
  if (!validDate(start) || !validDate(end)) return null;
  if (end < start) [start, end] = [end, start];

  if (!Array.isArray(body.guests)) return null;
  const guests = [...new Set(body.guests.filter((g) => typeof g === "string").map(clean).filter(Boolean))]
    .map((g) => g.slice(0, 100))
    .slice(0, 30);
  if (!guests.length) return null;

  const color = Number.isInteger(body.color) && body.color >= 0 && body.color < COLORS ? body.color : 0;
  const note = typeof body.note === "string" ? clean(body.note).slice(0, 200) : "";
  return { start, end, guests, color, note };
}

export function rowToStay(r) {
  let guests = [];
  try { guests = JSON.parse(r.guests); } catch {}
  return {
    id: r.id,
    start: r.start_date,
    end: r.end_date,
    guests,
    color: r.color,
    note: r.note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
