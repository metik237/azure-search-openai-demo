// GET /api/stays   -> all stays
// POST /api/stays  -> create a stay

import { json, parseStay, rowToStay } from "../../_shared/stay.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM stays ORDER BY start_date, end_date, created_at").all();
  return json(results.map(rowToStay), 200);
}

export async function onRequestPost({ request, env }) {
  const stay = parseStay(await request.json().catch(() => null));
  if (!stay) return json({ error: "Neveljaven vpis." }, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO stays (id, start_date, end_date, guests, color, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(id, stay.start, stay.end, JSON.stringify(stay.guests), stay.color, stay.note, now, now)
    .run();

  return json({ id, ...stay, createdAt: now, updatedAt: now }, 201);
}
