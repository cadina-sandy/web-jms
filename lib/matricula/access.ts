import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export type StaffRole = 'admin' | 'viewer';

export function staffRole(request: Request): StaffRole | null {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const admin = process.env.MATRICULA_EXPORT_TOKEN;
  const viewer = process.env.MATRICULA_VIEW_TOKEN;
  const hash = (value: string) => createHash('sha256').update(value).digest();
  const suppliedHash = hash(supplied);
  const isAdmin = timingSafeEqual(suppliedHash, hash(admin ?? '')) && !!admin;
  const isViewer = timingSafeEqual(suppliedHash, hash(viewer ?? '')) && !!viewer;
  // A coinciding configuration must never elevate the read-only credential.
  if (isViewer) return 'viewer';
  if (isAdmin) return 'admin';
  return null;
}

export function authorizeStaff(request: Request, permission: 'admin' | 'view' = 'admin'): Response | null {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  if (!process.env.MATRICULA_EXPORT_TOKEN && !process.env.MATRICULA_VIEW_TOKEN) {
    return Response.json({ error: 'Acceso de personal no habilitado por administración.' }, { status: 503, headers });
  }
  const role = staffRole(request);
  if (!role) return Response.json({ error: 'Acceso no autorizado.' }, { status: 401, headers });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
  if (permission === 'admin' && role !== 'admin') {
    return Response.json({ error: 'Este acceso solo permite ver fichas.' }, { status: 403, headers });
  }
  return null;
}
