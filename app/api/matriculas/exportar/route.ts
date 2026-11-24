import { authorizeStaff } from '@/lib/matricula/access';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { enrollmentCourseVariants, enrollmentLevel, fields } from '@/lib/matricula/fields';
import { getSql, readEnrollmentColumn } from '@/lib/matricula/db';
import { labels } from '@/lib/matricula/labels';
import { csv } from '@/lib/matricula/csv';
import { enrollmentWord } from '@/lib/matricula/word';
import { validEnrollmentSelection } from '@/lib/matricula/selection';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = authorizeStaff(request);
  if (denied) return denied;
  let body;
  try { body = await request.json() as { columns?: unknown; course?: unknown; ids?: unknown; format?: unknown }; } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const ids = body?.ids;
  const format = body?.format ?? 'csv';
  if (!['csv', 'docx'].includes(format as string)) {
    return Response.json({ error: 'Formato de descarga inválido.' }, { status: 400 });
  }
  if (ids !== undefined && !validEnrollmentSelection(ids)) {
    return Response.json({ error: 'Selecciona fichas válidas, sin repetir. Máximo 10000 por descarga.' }, { status: 400 });
  }
  if (format === 'docx' && ids === undefined) {
    return Response.json({ error: 'Selecciona al menos una ficha para descargar en Word.' }, { status: 400 });
  }
  const allowed = [...fields, 'id', 'created_at'];
  const columns: unknown = format === 'docx' || body?.columns === undefined ? allowed : body.columns;
  const course = body?.course;
  if (course != null && (typeof course !== 'string' || !enrollmentCourseVariants(course).length)) {
    return Response.json({ error: 'Selecciona un curso válido.' }, { status: 400 });
  }
  if (!Array.isArray(columns) || !columns.length || columns.length > allowed.length || new Set(columns).size !== columns.length || columns.some(c => typeof c !== 'string' || !allowed.includes(c))) return Response.json({ error: 'Selecciona columnas válidas, sin repetir.' }, { status: 400 });
  try {
    const parameters: unknown[] = [];
    const filters: string[] = [];
    if (course) {
      parameters.push(enrollmentCourseVariants(course as string));
      filters.push(`"curso" = ANY($${parameters.length}::text[])`);
    }
    if (Array.isArray(ids)) {
      parameters.push(ids);
      filters.push(`id = ANY($${parameters.length}::uuid[])`);
    }
    const where = filters.length ? ' WHERE ' + filters.join(' AND ') : '';
    const rows = await getSql().query(
      `SELECT ${columns.map(readEnrollmentColumn).join(',')} FROM ${tableName(databaseSchema())} AS enrollment${where} ORDER BY created_at, id LIMIT 10001`,
      parameters,
    );
    if (rows.length > 10000) return Response.json({ error: 'Más de 10000 fichas. Solicita una exportación por lotes a administración.' }, { status: 413 });
    if (Array.isArray(ids) && rows.length !== ids.length) {
      return Response.json({ error: 'Una ficha seleccionada ya no está disponible o no corresponde al curso. Actualiza el listado.' }, { status: 409 });
    }
    if (format === 'docx') {
      const records = rows.map(row => ({ ...row, id: String(row.id), curso: enrollmentLevel(row.curso) }));
      const file = await enrollmentWord(records);
      return new Response(new Uint8Array(file), { headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="fichas-matricula-2027.docx"',
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      } });
    }
    const courseSuffix = course ? '-' + course.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const exportedColumns = body?.columns === undefined
      ? columns.filter(column => rows.some(row => String(row[column] ?? '').trim() !== ''))
      : columns;
    if (!exportedColumns.length) {
      return Response.json({ error: 'No hay matrículas para la selección.' }, { status: 404 });
    }
    return new Response(csv(exportedColumns, rows.map(row => ({ ...row, curso: enrollmentLevel(row.curso) })), labels), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="matriculas-2027${courseSuffix}.csv"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return Response.json({ error: 'No se pudo exportar. Verifica que exista una matrícula guardada.' }, { status: 503 }); }
}
