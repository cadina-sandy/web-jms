import 'server-only';
import { neon } from '@neondatabase/serverless';
import { fields, type Answers } from './fields';

export function getSql() {
  const url = process.env.MATRICULA_DATABASE_URL;
  if (!url) throw new Error('MATRICULA_DATABASE_URL no configurada');
  return neon(url);
}
// Identifiers come exclusively from the committed allowlist, never from requests.
export const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
export const schema = `CREATE TABLE IF NOT EXISTS matriculas_2027 (
  id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
  ${fields.map(field => `${quote(field)} text NOT NULL DEFAULT ''`).join(',\n')}
)`;
export async function save(answers: Answers, id: string) {
  const sql = getSql();
  const values = [id, ...fields.map(field => answers[field] ?? '')];
  const result = await sql.transaction([
    sql.query(schema),
    sql.query(`INSERT INTO matriculas_2027 (id, ${fields.map(quote).join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO NOTHING RETURNING id`, values),
  ]);
  return { id, created: result[1].length > 0 };
}
