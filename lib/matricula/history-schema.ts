export const historyTable = (target: string) => `"${target}"."matriculas_2027_historial"`;
export const historySchema = (target: string) => `CREATE TABLE IF NOT EXISTS ${historyTable(target)} (
  event_id bigserial PRIMARY KEY, occurred_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL, actor text NOT NULL, record_ids uuid[] NOT NULL DEFAULT '{}', details jsonb NOT NULL DEFAULT '{}'
)`;
