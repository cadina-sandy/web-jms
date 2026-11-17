import { authorizeStaff } from '@/lib/matricula/access';
import { getSql, quote } from '@/lib/matricula/db';
import { enrollmentCourses, fields } from '@/lib/matricula/fields';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { pageSize } from '@/lib/matricula/view';

export const runtime = 'nodejs';

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const summaryColumns = ['id', 'fechaMatricula', 'curso', 'nombres', 'apellidoPaterno', 'apellidoMaterno'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const denied = authorizeStaff(request);
  if (denied) return denied;
  let body: { id?: unknown; course?: unknown; search?: unknown; offset?: unknown };
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers });
  }

  const { id, course, search = '', offset = 0 } = body;
  if (id !== undefined && (typeof id !== 'string' || !uuid.test(id))) {
    return Response.json({ error: 'Comprobante inválido.' }, { status: 400, headers });
  }
  if (course != null && (typeof course !== 'string' || !enrollmentCourses.includes(course))) {
    return Response.json({ error: 'Selecciona un curso válido.' }, { status: 400, headers });
  }
  if (typeof search !== 'string' || search.length > 100 || typeof offset !== 'number' || !Number.isSafeInteger(offset) || offset < 0) {
    return Response.json({ error: 'Revisa la búsqueda.' }, { status: 400, headers });
  }

  try {
    const sql = getSql();
    const table = tableName(databaseSchema());
    if (typeof id === 'string') {
      const [record] = await sql.query(`SELECT ${['id', ...fields].map(quote).join(', ')} FROM ${table} WHERE id = $1`, [id]);
      if (!record) return Response.json({ error: 'No se encontró esa ficha.' }, { status: 404, headers });
      return Response.json({ record }, { headers });
    }
    const name = `regexp_replace(concat_ws(' ', nullif(trim(nombres), ''), nullif(trim("apellidoPaterno"), ''), nullif(trim("apellidoMaterno"), '')), '[[:space:]]+', ' ', 'g')`;
    const rows = await sql.query(
      `SELECT ${summaryColumns.map(quote).join(', ')} FROM ${table}
       WHERE ($1::text IS NULL OR curso = $1)
         AND strpos(translate(lower(${name}), 'áéíóúüñ', 'aeiouun'), translate(lower($2), 'áéíóúüñ', 'aeiouun')) > 0
       ORDER BY created_at DESC, id LIMIT $3 OFFSET $4`,
      [course ?? null, search.trim().replace(/\s+/g, ' '), pageSize + 1, offset],
    );
    return Response.json({ records: rows.slice(0, pageSize), hasMore: rows.length > pageSize }, { headers });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '42P01') {
      if (id !== undefined) return Response.json({ error: 'No se encontró esa ficha.' }, { status: 404, headers });
      return Response.json({ records: [], hasMore: false }, { headers });
    }
    return Response.json({ error: 'No se pudieron consultar las matrículas. Intenta nuevamente.' }, { status: 503, headers });
  }
}
