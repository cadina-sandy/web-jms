import { authorizeStaff, staffRole } from '@/lib/matricula/access';
import { getSql, quote, readEnrollmentColumn } from '@/lib/matricula/db';
import { enrollmentCourseVariants, enrollmentLevel, fields } from '@/lib/matricula/fields';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { pageSize } from '@/lib/matricula/view';

import { ensureHistoryStorage, recordHistory } from '@/lib/matricula/history';

export const runtime = 'nodejs';

const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const summaryColumns = ['id', 'numero_ficha', 'fechaMatricula', 'curso', 'nombres', 'apellidoPaterno', 'apellidoMaterno'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const denied = authorizeStaff(request, 'view');
  if (denied) return denied;
  const role = staffRole(request);
  const headers = { ...privateHeaders, 'X-Matricula-Role': role! };
  let body: { id?: unknown; ids?: unknown; course?: unknown; search?: unknown; offset?: unknown };
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers });
  }

  const { id, ids, course, search = '', offset = 0 } = body;
  if (ids !== undefined && role !== 'admin' && role !== 'super') {
    return Response.json({ error: 'Este acceso solo permite ver fichas individualmente.' }, { status: 403, headers });
  }
  if (ids !== undefined && (!Array.isArray(ids) || !ids.length || ids.length > pageSize || ids.some(value => typeof value !== 'string' || !uuid.test(value)) || new Set(ids).size !== ids.length || id !== undefined)) {
    return Response.json({ error: 'Selecciona fichas válidas, sin repetir.' }, { status: 400, headers });
  }
  if (id !== undefined && (typeof id !== 'string' || !uuid.test(id))) {
    return Response.json({ error: 'Comprobante inválido.' }, { status: 400, headers });
  }
  if (course != null && (typeof course !== 'string' || !enrollmentCourseVariants(course).length)) {
    return Response.json({ error: 'Selecciona un curso válido.' }, { status: 400, headers });
  }
  if (typeof search !== 'string' || search.length > 100 || typeof offset !== 'number' || !Number.isSafeInteger(offset) || offset < 0) {
    return Response.json({ error: 'Revisa la búsqueda.' }, { status: 400, headers });
  }

  try {
    await ensureHistoryStorage();
    const sql = getSql();
    const table = tableName(databaseSchema());
    if (typeof id === 'string') {
      const [record] = await sql.query(`SELECT ${['id', 'numero_ficha', ...fields].map(readEnrollmentColumn).join(', ')} FROM ${table} AS enrollment WHERE id = $1 AND deleted_at IS NULL`, [id]);
      if (!record) return Response.json({ error: 'No se encontró esa ficha.' }, { status: 404, headers });
      await recordHistory('ver', role!, [id]);
      return Response.json({ record: { ...record, curso: enrollmentLevel(record.curso) } }, { headers });
    }
    if (Array.isArray(ids)) {
      const records = await sql.query(
        `SELECT ${['id', 'numero_ficha', ...fields].map(readEnrollmentColumn).join(', ')} FROM ${table} AS enrollment WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL ORDER BY array_position($1::uuid[], id)`,
        [ids],
      );
      if (records.length !== ids.length) return Response.json({ error: 'Una ficha seleccionada ya no está disponible. Actualiza el listado.' }, { status: 409, headers });
      await recordHistory('preparar_impresion', role!, records.map(row => String(row.id)), { count: records.length });
      return Response.json({ records: records.map(row => ({ ...row, curso: enrollmentLevel(row.curso) })) }, { headers });
    }
    const name = `regexp_replace(concat_ws(' ', nullif(trim(nombres), ''), nullif(trim("apellidoPaterno"), ''), nullif(trim("apellidoMaterno"), '')), '[[:space:]]+', ' ', 'g')`;
    const rows = await sql.query(
      `SELECT ${summaryColumns.map(quote).join(', ')} FROM ${table}
       WHERE deleted_at IS NULL AND ($1::text[] IS NULL OR curso = ANY($1::text[]))
         AND strpos(translate(lower(${name}), 'áéíóúüñ', 'aeiouun'), translate(lower($2), 'áéíóúüñ', 'aeiouun')) > 0
       ORDER BY created_at DESC, id LIMIT $3 OFFSET $4`,
      [typeof course === 'string' ? enrollmentCourseVariants(course) : null, search.trim().replace(/\s+/g, ' '), pageSize + 1, offset],
    );
    await recordHistory('listar', role!, rows.slice(0, pageSize).map(row => String(row.id)), { count: Math.min(rows.length, pageSize), course: course ?? null });
    return Response.json({ records: rows.slice(0, pageSize).map(row => ({ ...row, curso: enrollmentLevel(row.curso) })), hasMore: rows.length > pageSize }, { headers });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '42P01') {
      if (id !== undefined || ids !== undefined) return Response.json({ error: 'No se encontró esa ficha.' }, { status: 404, headers });
      return Response.json({ records: [], hasMore: false }, { headers });
    }
    return Response.json({ error: 'No se pudieron consultar las matrículas. Intenta nuevamente.' }, { status: 503, headers });
  }
}


