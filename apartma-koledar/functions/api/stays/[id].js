// PUT /api/stays/:id     -> replace a stay
// DELETE /api/stays/:id  -> delete a stay

import { json, parseStay } from "../../_shared/stay.js";

export async function onRequestPut({ request, env, params }) {
  const stay = parseStay(await request.json().catch(() => null));
  if (!stay) return json({ error: "Neveljaven vpis." }, 400);

  const now = new Date().toISOString();
  const { meta } = await env.DB.prepare(
    "UPDATE stays SET start_date = ?, end_date = ?, guests = ?, color = ?, note = ?, updated_at = ? WHERE id = ?"
  )
    .bind(stay.start, stay.end, JSON.stringify(stay.guests), stay.color, stay.note, now, params.id)
    .run();

  if (!meta.changes) return json({ error: "Vpis ne obstaja." }, 404);
  return json({ id: params.id, ...stay, updatedAt: now }, 200);
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM stays WHERE id = ?").bind(params.id).run();
  return new Response(null, { status: 204 });
}
