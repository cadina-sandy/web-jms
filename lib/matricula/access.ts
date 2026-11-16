import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
export function authorizeStaff(request: Request): Response | null {
  const secret = process.env.MATRICULA_EXPORT_TOKEN;
  if (!secret) return Response.json({ error: 'Acceso de personal no habilitado por administración.' }, { status: 503 });
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(secret))) return Response.json({ error: 'Acceso no autorizado.' }, { status: 401 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  return null;
}
