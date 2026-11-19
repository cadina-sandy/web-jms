import { authorizeStaff } from '@/lib/matricula/access';
import { getSql } from '@/lib/matricula/db';
import { databaseSchema, tableName } from '@/lib/matricula/target';

export const runtime = 'nodejs';

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request) {
  const denied = authorizeStaff(request);
  if (denied) return denied;
  let body: { id?: unknown };
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers });
  }

  if (typeof body.id !== 'string' || !uuid.test(body.id)) {
    return Response.json({ error: 'Comprobante inválido.' }, { status: 400, headers });
  }
  try {
    const rows = await getSql().query(
      `DELETE FROM ${tableName(databaseSchema())} WHERE id = $1 RETURNING id`,
      [body.id],
    );
    if (!rows.length) return Response.json({ error: 'No se encontró esa ficha. Actualiza el listado.' }, { status: 404, headers });
    return Response.json({ id: body.id }, { headers });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '42P01') {
      return Response.json({ error: 'No se encontró esa ficha. Actualiza el listado.' }, { status: 404, headers });
    }
    return Response.json({ error: 'No se pudo eliminar la ficha. Intenta nuevamente.' }, { status: 503, headers });
  }
}
