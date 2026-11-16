import { createHash, timingSafeEqual } from 'node:crypto';
import { fields } from '@/lib/matricula/fields';
import { getSql, quote } from '@/lib/matricula/db';
import { csv } from '@/lib/matricula/csv';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const secret = process.env.MATRICULA_EXPORT_TOKEN;
  if (!secret) return Response.json({ error: 'Exportación no habilitada por administración.' }, { status: 503 });
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(secret))) return Response.json({ error: 'Acceso no autorizado.' }, { status: 401 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  let body;
  try { body = await request.json() as { columns?: unknown }; } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const columns: unknown = body?.columns;
  const allowed = ['id', 'created_at', ...fields];
  if (!Array.isArray(columns) || !columns.length || columns.length > allowed.length || new Set(columns).size !== columns.length || columns.some(c => typeof c !== 'string' || !allowed.includes(c))) return Response.json({ error: 'Selecciona columnas válidas, sin repetir.' }, { status: 400 });
  try {
    const rows = await getSql().query(`SELECT ${columns.map(quote).join(',')} FROM matriculas_2027 ORDER BY created_at, id LIMIT 10001`);
    if (rows.length > 10000) return Response.json({ error: 'Más de 10000 fichas. Solicita una exportación por lotes a administración.' }, { status: 413 });
    return new Response(csv(columns, rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="matriculas-2027.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return Response.json({ error: 'No se pudo exportar. Verifica que exista una matrícula guardada.' }, { status: 503 }); }
}
