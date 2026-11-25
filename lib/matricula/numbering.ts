import { tableName } from './target';
/** Run under the existing per-schema advisory transaction lock. Numbers are never reused. */
export function enrollmentNumberingSql(target: string): string[] {
  const table = tableName(target);
  const sequence = `"${target}"."matriculas_2027_numero_seq"`;
  return [
    `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS numero_ficha bigint`,
    `CREATE SEQUENCE IF NOT EXISTS ${sequence} MINVALUE 1`,
    `ALTER TABLE ${table} ALTER COLUMN numero_ficha SET DEFAULT nextval('${sequence}'::regclass)`,
    `WITH baseline AS (
      SELECT GREATEST(COALESCE(MAX(numero_ficha),0), (SELECT CASE WHEN is_called THEN last_value ELSE 0 END FROM ${sequence})) AS number FROM ${table}
    ), ranked AS (
      SELECT id,row_number() OVER (ORDER BY created_at,id) AS position FROM ${table} WHERE numero_ficha IS NULL
    ) UPDATE ${table} AS enrollment SET numero_ficha=baseline.number+ranked.position FROM ranked,baseline WHERE enrollment.id=ranked.id`,
    `SELECT setval('${sequence}'::regclass,
      GREATEST(COALESCE((SELECT MAX(numero_ficha) FROM ${table}),0),(SELECT last_value FROM ${sequence})),
      EXISTS (SELECT 1 FROM ${table} WHERE numero_ficha IS NOT NULL) OR (SELECT is_called FROM ${sequence}))`,
    `CREATE UNIQUE INDEX IF NOT EXISTS matriculas_2027_numero_unico ON ${table} (numero_ficha)`,
    `ALTER TABLE ${table} ALTER COLUMN numero_ficha SET NOT NULL`,
    `ALTER SEQUENCE ${sequence} OWNED BY ${table}.numero_ficha`,
  ];
}
