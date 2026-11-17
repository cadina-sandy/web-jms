import 'server-only';
import { neon } from '@neondatabase/serverless';
import { databaseSchema, tableName } from './target';
import { fields, type Answers } from './fields';

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
    sql.query(`ALTER TABLE ${table} ${fields.map(field => `ADD COLUMN IF NOT EXISTS ${quote(field)} text NOT NULL DEFAULT ''`).join(', ')}`),
    sql.query(`INSERT INTO ${table} (id, ${fields.map(quote).join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO NOTHING RETURNING id`, values),
  ]);
  return { id, created: result[4].length > 0 };
}
