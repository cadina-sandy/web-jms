import 'server-only';
import { getSql, quote, schema } from './db';
import { databaseSchema, tableName } from './target';
import { historySchema, historyTable } from './history-schema';
import type { HistoryAction } from './history-actions';
export { historyTable } from './history-schema';
const ready = new Map<string, Promise<void>>();
export async function ensureHistoryStorage() {
  const target = databaseSchema();
  let setup = ready.get(target);
  if (!setup) {
    setup = (async () => {
      const sql = getSql();
      await sql.transaction([
        sql.query('SELECT pg_advisory_xact_lock(hashtext($1))', [target]),
        sql.query(`CREATE SCHEMA IF NOT EXISTS ${quote(target)}`),
        sql.query(schema(target)),
        sql.query(`ALTER TABLE ${tableName(target)} ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by text`),
        sql.query(historySchema(target)),
        sql.query(`CREATE INDEX IF NOT EXISTS matriculas_2027_history_date_idx ON ${historyTable(target)} (occurred_at DESC, event_id DESC)`),
      ]);
    })();
    ready.set(target, setup);
  }
  try { await setup; } catch (error) { ready.delete(target); throw error; }
}
export async function recordHistory(action: HistoryAction, actor: string, ids: string[] = [], details: Record<string, unknown> = {}) {
  await ensureHistoryStorage();
  await getSql().query(`INSERT INTO ${historyTable(databaseSchema())} (action, actor, record_ids, details) VALUES ($1,$2,$3::uuid[],$4::jsonb)`, [action, actor, ids, JSON.stringify(details)]);
}

/** The row change and its history event commit together; failed logging rolls back the change. */
export async function changeEnrollmentState(id: string, actor: string, action: 'enviar_papelera' | 'restaurar' | 'borrar_definitivo') {
  await ensureHistoryStorage();
  const table = tableName(databaseSchema());
  const change = action === 'enviar_papelera'
    ? `UPDATE ${table} SET deleted_at=now(), deleted_by=$2 WHERE id=$1 AND deleted_at IS NULL RETURNING id`
    : action === 'restaurar'
      ? `UPDATE ${table} SET deleted_at=NULL, deleted_by=NULL WHERE id=$1 AND deleted_at IS NOT NULL RETURNING id`
      : `DELETE FROM ${table} WHERE id=$1 AND deleted_at IS NOT NULL RETURNING id`;
  // Keep $2 bound for all variants, including permanent delete.
  const withActor = action === 'enviar_papelera' ? change : change.replace('WHERE id=$1', 'WHERE $2::text IS NOT NULL AND id=$1');
  return getSql().query(`WITH changed AS (${withActor}), logged AS (
    INSERT INTO ${historyTable(databaseSchema())} (action, actor, record_ids)
    SELECT $3,$2,ARRAY[id] FROM changed RETURNING event_id
  ) SELECT id FROM changed WHERE EXISTS (SELECT 1 FROM logged)`, [id, actor, action]);
}
