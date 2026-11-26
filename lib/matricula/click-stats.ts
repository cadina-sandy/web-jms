import 'server-only';
import { getSql, quote } from './db';
import { databaseSchema } from './target';
import { enrollmentClickEvents, type EnrollmentClickEvent } from './click-events';

const ready = new Map<string, Promise<void>>();
export const clickTable = (schema: string) => `${quote(schema)}."matricula_clicks_2027"`;
async function storage() {
  const schema = databaseSchema();
  if (!ready.has(schema)) {
    const sql = getSql();
    const pending = sql.transaction([
      sql.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`clicks:${schema}`]),
      sql.query(`CREATE SCHEMA IF NOT EXISTS ${quote(schema)}`),
      sql.query(`CREATE TABLE IF NOT EXISTS ${clickTable(schema)} (event_id uuid PRIMARY KEY, event text NOT NULL CHECK (event IN ('click_inscribir_alumno','click_pre_matricula_2027')), created_at timestamptz NOT NULL DEFAULT now())`),
      sql.query(`CREATE INDEX IF NOT EXISTS matricula_clicks_date_idx ON ${clickTable(schema)} (created_at, event)`),
    ]).then(() => undefined).catch((error: unknown) => { ready.delete(schema); throw error; });
    ready.set(schema, pending);
  }
  await ready.get(schema);
  return clickTable(schema);
}
export async function recordEnrollmentClick(event: EnrollmentClickEvent, id: string) {
  const table = await storage();
  await getSql().query(`INSERT INTO ${table} (event_id,event) VALUES ($1,$2) ON CONFLICT (event_id) DO NOTHING`, [id,event]);
}
export async function enrollmentClickCounts(from = '', to = '') {
  const table = await storage();
  const rows = await getSql().query(`SELECT event, count(*)::text AS count FROM ${table}
    WHERE ($1::date IS NULL OR created_at >= ($1::date::timestamp AT TIME ZONE 'America/Santiago'))
      AND ($2::date IS NULL OR created_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santiago'))
    GROUP BY event`, [from || null,to || null]);
  return Object.keys(enrollmentClickEvents).map(event => ({ event: event as EnrollmentClickEvent, count: Number(rows.find(row => row.event === event)?.count ?? 0) }));
}
