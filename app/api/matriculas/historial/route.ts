import { enrollmentClickCounts } from '@/lib/matricula/click-stats';
import { authorizeStaff } from '@/lib/matricula/access';
import { ensureHistoryStorage, recordHistory, historyTable, changeEnrollmentState } from '@/lib/matricula/history';
import { historyActions, historyActors, type HistoryAction } from '@/lib/matricula/history-actions';
import { getSql, readEnrollmentColumn } from '@/lib/matricula/db';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { enrollmentLevel, fields } from '@/lib/matricula/fields';
import { csv } from '@/lib/matricula/csv';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validDate = (value: unknown) => value === '' || value == null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);

export async function POST(request: Request) {
  const denied = authorizeStaff(request, 'super'); if (denied) return denied;
  let body: { mode?: string; offset?: number; from?: string; to?: string; action?: string; id?: string };
  try { body = await request.json() as typeof body; if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers }); }
  const { mode = 'history', offset = 0, from = '', to = '', action = '', id = '' } = body;
  if (!['history', 'csv', 'trash', 'record', 'clicks'].includes(mode) || !Number.isSafeInteger(offset) || offset < 0 || !validDate(from) || !validDate(to) || (from && to && from > to) || typeof action !== 'string' || (action && !Object.hasOwn(historyActions, action)) || typeof id !== 'string' || (id && !uuid.test(id)) || (mode === 'record' && !id)) return Response.json({ error: 'Revisa los filtros.' }, { status: 400, headers });
  try {
    if (mode === 'clicks') return Response.json({ clicks: await enrollmentClickCounts(from, to) }, { headers });
    await ensureHistoryStorage();
    const sql = getSql(); const table = tableName(databaseSchema());
    if (mode === 'record') {
      const [record] = await sql.query(`SELECT ${['id', 'numero_ficha', ...fields].map(readEnrollmentColumn).join(',')}, deleted_at, deleted_by FROM ${table} AS enrollment WHERE id=$1 AND deleted_at IS NOT NULL`, [id]);
      if (!record) return Response.json({ error: 'La ficha ya no está en la papelera.' }, { status: 404, headers });
      await recordHistory('ver_papelera', 'super', [id]);
      return Response.json({ record: { ...record, curso: enrollmentLevel(record.curso) } }, { headers });
    }
    if (mode === 'trash') {
      const rows = await sql.query(`SELECT id,numero_ficha,nombres,"apellidoPaterno","apellidoMaterno",curso,deleted_at,deleted_by FROM ${table} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC,id LIMIT 26 OFFSET $1`, [offset]);
      return Response.json({ records: rows.slice(0,25).map(row => ({ ...row, curso: enrollmentLevel(row.curso) })), hasMore: rows.length > 25, offset }, { headers });
    }
    const rows = await sql.query(`SELECT event_id::text,occurred_at,action,actor,record_ids,details FROM ${historyTable(databaseSchema())}
      WHERE ($1::date IS NULL OR occurred_at >= ($1::date::timestamp AT TIME ZONE 'America/Santiago'))
        AND ($2::date IS NULL OR occurred_at < (($2::date + 1)::timestamp AT TIME ZONE 'America/Santiago'))
        AND ($3::text = '' OR action=$3) AND ($4::uuid IS NULL OR $4::uuid=ANY(record_ids))
      ORDER BY occurred_at DESC,event_id DESC LIMIT $5 OFFSET $6`, [from || null, to || null, action, id || null, mode === 'csv' ? 10001 : 51, mode === 'csv' ? 0 : offset]);
    if (mode === 'csv') {
      if (rows.length > 10000) return Response.json({ error: 'Más de 10000 eventos. Acota el rango de fechas.' }, { status: 413, headers });
      const output = rows.map(row => ({ ...row, occurred_at: new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(row.occurred_at)), action: historyActions[row.action as HistoryAction] ?? row.action, actor: historyActors[String(row.actor)] ?? row.actor, record_ids: (row.record_ids as string[]).join(' | '), details: [Array.isArray(row.details?.numbers) && row.details.numbers.length ? `Fichas: ${row.details.numbers.join(', ')}` : '', row.details?.count != null ? `Cantidad: ${row.details.count}` : '', row.details?.course ? `Curso: ${row.details.course}` : ''].filter(Boolean).join(' · ') }));
      await recordHistory('exportar_historial', 'super', [], { count: rows.length });
      return new Response(csv(['event_id','occurred_at','action','actor','record_ids','details'], output, { event_id: 'Evento', occurred_at: 'Fecha y hora', action: 'Acción', actor: 'Perfil de acceso', record_ids: 'Comprobantes', details: 'Detalles' }), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="historial-matriculas.csv"' } });
    }
    return Response.json({ events: rows.slice(0,50), hasMore: rows.length > 50, offset }, { headers });
  } catch { return Response.json({ error: 'No se pudo consultar el historial. Intenta nuevamente.' }, { status: 503, headers }); }
}

export async function PATCH(request: Request) {
  const denied = authorizeStaff(request, 'super'); if (denied) return denied;
  let body: { id?: unknown; action?: unknown; confirmation?: unknown; confirmedId?: unknown } | null;
  try { body = await request.json() as typeof body; } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers }); }
  if (!body || typeof body.id !== 'string' || !uuid.test(body.id) || (typeof body.action !== 'string' || !['restore','purge'].includes(body.action))) return Response.json({ error: 'Revisa la ficha y la acción.' }, { status: 400, headers });
  if (body.action === 'purge' && (body.confirmation !== 'ELIMINAR' || body.confirmedId !== body.id)) return Response.json({ error: 'Confirma explícitamente el borrado de esta ficha.' }, { status: 400, headers });
  try {
    const rows = await changeEnrollmentState(body.id, 'super', body.action === 'restore' ? 'restaurar' : 'borrar_definitivo');
    if (!rows.length) return Response.json({ error: 'La ficha ya no está en la papelera. Actualiza el listado.' }, { status: 409, headers });
    return Response.json({ id: body.id, action: body.action }, { headers });
  } catch { return Response.json({ error: 'No se pudo completar la acción. No confirmamos ningún cambio.' }, { status: 503, headers }); }
}
