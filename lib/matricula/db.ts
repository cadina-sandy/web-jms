import 'server-only';
import { neon } from '@neondatabase/serverless';
import { databaseSchema, tableName } from './target';
import { fields, type Answers } from './fields';
import type { EnrollmentReceipt } from './receipt';

export function getSql() {
  const url = process.env.MATRICULA_DATABASE_URL;
  if (!url) throw new Error('MATRICULA_DATABASE_URL no configurada');
  return neon(url);
}
// Identifiers come exclusively from the committed allowlist, never from requests.
export const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
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
    sql.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS receipt_sent_at timestamptz, ADD COLUMN IF NOT EXISTS receipt_attempted_at timestamptz, ${fields.map(field => `ADD COLUMN IF NOT EXISTS ${quote(field)} text NOT NULL DEFAULT ''`).join(', ')}`),
    sql.query(`INSERT INTO ${table} (id, ${fields.map(quote).join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO NOTHING RETURNING id`, values),
    sql.query(`SELECT
      CASE WHEN "apoderadoCorreoUsuario" <> '' AND "apoderadoCorreoDominio" <> ''
        THEN "apoderadoCorreoUsuario" || '@' || CASE WHEN "apoderadoCorreoDominio" = 'otra'
          THEN "apoderadoCorreoDominioOtro" ELSE "apoderadoCorreoDominio" END
        ELSE '' END AS recipient,
      "fechaMatricula" AS date, curso AS course,
      receipt_sent_at IS NOT NULL AS sent,
      created_at > now() - interval '23 hours' AS "retryAllowed"
      FROM ${table} WHERE id = $1`, [id]),
  ]);
  const row = result[5][0] as EnrollmentReceipt | undefined;
  if (!row) throw new Error('Ficha guardada no encontrada');
  return { id, created: result[4].length > 0, receipt: row };
}

export async function markReceiptSent(id: string) {
  await getSql().query(
    `UPDATE ${tableName(databaseSchema())} SET receipt_sent_at = now() WHERE id = $1 AND receipt_sent_at IS NULL`,
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
