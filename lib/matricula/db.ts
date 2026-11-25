import 'server-only';
import { neon } from '@neondatabase/serverless';
import { databaseSchema, tableName } from './target';
import { fields, type Answers } from './fields';
import { historySchema, historyTable } from './history-schema';
import type { EnrollmentReceipt } from './receipt';

export function getSql() {
  const url = process.env.MATRICULA_DATABASE_URL;
  if (!url) throw new Error('MATRICULA_DATABASE_URL no configurada');
  return neon(url);
}
// Identifiers come exclusively from the committed allowlist, never from requests.
export const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
// Older tables get the column on the next save. Reads also work before that first save.
export const readEnrollmentColumn = (name: string) => name === 'comprobacionDireccion'
  ? `COALESCE(to_jsonb(enrollment)->>'comprobacionDireccion', '') AS "comprobacionDireccion"`
  : quote(name);
export const schema = (target: string) => `CREATE TABLE IF NOT EXISTS ${tableName(target)} (
  id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
  ${fields.map(field => `${quote(field)} text NOT NULL DEFAULT ''`).join(',\n')}
)`;
export async function save(answers: Answers, id: string) {
  const sql = getSql();
  const target = databaseSchema();
  const table = tableName(target);
  const values = [id, ...fields.map(field => answers[field] ?? '')];
  const result = await sql.transaction([
    sql.query('SELECT pg_advisory_xact_lock(hashtext($1))', [target]),
    sql.query(`CREATE SCHEMA IF NOT EXISTS ${quote(target)}`),
    sql.query(schema(target)),
    sql.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS deleted_at timestamptz, ADD COLUMN IF NOT EXISTS deleted_by text, ADD COLUMN IF NOT EXISTS receipt_sent_at timestamptz, ADD COLUMN IF NOT EXISTS receipt_attempted_at timestamptz, ${fields.map(field => `ADD COLUMN IF NOT EXISTS ${quote(field)} text NOT NULL DEFAULT ''`).join(', ')}`),
    sql.query(historySchema(target)),
    sql.query(`WITH inserted AS (INSERT INTO ${table} (id, ${fields.map(quote).join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO NOTHING RETURNING id), logged AS (INSERT INTO ${historyTable(target)} (action,actor,record_ids) SELECT 'crear','public',ARRAY[id] FROM inserted) SELECT id FROM inserted`, values),
    sql.query(`SELECT
      CASE WHEN "apoderadoCorreoUsuario" <> '' AND "apoderadoCorreoDominio" <> ''
        THEN "apoderadoCorreoUsuario" || '@' || CASE WHEN "apoderadoCorreoDominio" = 'otra'
          THEN "apoderadoCorreoDominioOtro" ELSE "apoderadoCorreoDominio" END
        ELSE '' END AS recipient,
      "fechaMatricula" AS date, curso AS course,
      "comprobacionDireccion",
      receipt_sent_at IS NOT NULL AS sent,
      created_at > now() - interval '23 hours' AS "retryAllowed"
      FROM ${table} WHERE id = $1`, [id]),
  ]);
  const row = result[6][0] as (EnrollmentReceipt & { comprobacionDireccion: string }) | undefined;
  if (!row) throw new Error('Ficha guardada no encontrada');
  return { id, created: result[5].length > 0, receipt: row };
}

export async function markAddressFound(id: string) {
  await getSql().query(
    `WITH changed AS (UPDATE ${tableName(databaseSchema())} SET "comprobacionDireccion" = $2 WHERE id = $1 RETURNING id) INSERT INTO ${historyTable(databaseSchema())} (action,actor,record_ids) SELECT 'direccion_verificada','system',ARRAY[id] FROM changed`,
    [id, 'Dirección encontrada'],
  );
}

export async function markReceiptSent(id: string) {
  await getSql().query(
    `WITH changed AS (UPDATE ${tableName(databaseSchema())} SET receipt_sent_at = now() WHERE id = $1 AND receipt_sent_at IS NULL RETURNING id) INSERT INTO ${historyTable(databaseSchema())} (action,actor,record_ids) SELECT 'comprobante_enviado','system',ARRAY[id] FROM changed`,
    [id],
  );
}

export async function claimReceiptDelivery(id: string) {
  // SMTP has no idempotency key. Claim the send once before contacting Gmail.
  const rows = await getSql().query(
    `UPDATE ${tableName(databaseSchema())} SET receipt_attempted_at = now()
     WHERE id = $1 AND receipt_sent_at IS NULL AND receipt_attempted_at IS NULL
       AND created_at > now() - interval '23 hours'
     RETURNING id`,
    [id],
  );
  return rows.length === 1;
}

