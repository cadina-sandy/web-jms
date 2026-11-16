import { authorizeStaff } from '@/lib/matricula/access';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { fields } from '@/lib/matricula/fields';
import { getSql, quote } from '@/lib/matricula/db';
import { labels } from '@/lib/matricula/labels';
import { csv } from '@/lib/matricula/csv';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const denied = authorizeStaff(request);
  if (denied) return denied;
  let body;
  try { body = await request.json() as { columns?: unknown }; } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const columns: unknown = body?.columns;
  const allowed = ['id', 'created_at', ...fields];
  if (!Array.isArray(columns) || !columns.length || columns.length > allowed.length || new Set(columns).size !== columns.length || columns.some(c => typeof c !== 'string' || !allowed.includes(c))) return Response.json({ error: 'Selecciona columnas válidas, sin repetir.' }, { status: 400 });
  try {
    const rows = await getSql().query(`SELECT ${columns.map(quote).join(',')} FROM ${tableName(databaseSchema())} ORDER BY created_at, id LIMIT 10001`);
    if (rows.length > 10000) return Response.json({ error: 'Más de 10000 fichas. Solicita una exportación por lotes a administración.' }, { status: 413 });
    return new Response(csv(columns, rows, labels), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="matriculas-2027.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return Response.json({ error: 'No se pudo exportar. Verifica que exista una matrícula guardada.' }, { status: 503 }); }
}
