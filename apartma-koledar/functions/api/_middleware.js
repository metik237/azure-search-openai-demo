// Runs before every /api request: checks the optional PIN and makes sure the table exists.

import { json } from "../_shared/stay.js";

const SCHEMA = `CREATE TABLE IF NOT EXISTS stays (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  guests TEXT NOT NULL,
  color INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

let schemaReady = false;

async function sameText(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

export async function onRequest({ request, env, next }) {
  if (!env.DB) return json({ error: "Manjka D1 vezava z imenom DB (Settings → Bindings)." }, 500);

  if (env.PIN && !(await sameText(request.headers.get("x-pin") || "", env.PIN))) {
    return json({ error: "Napačen PIN." }, 401);
  }

  if (!schemaReady) {
    await env.DB.prepare(SCHEMA).run();
    schemaReady = true;
  }

  const res = await next();
  res.headers.set("cache-control", "no-store");
  return res;
}
