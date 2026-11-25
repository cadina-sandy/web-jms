import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

export type StaffRole = 'admin' | 'viewer' | 'super';

export function staffRole(request: Request): StaffRole | null {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  const admin = process.env.MATRICULA_EXPORT_TOKEN;
  const viewer = process.env.MATRICULA_VIEW_TOKEN;
  const superAdmin = process.env.MATRICULA_SUPER_TOKEN;
  const hash = (value: string) => createHash('sha256').update(value).digest();
  const suppliedHash = hash(supplied);
  const isAdmin = timingSafeEqual(suppliedHash, hash(admin ?? '')) && !!admin;
  const isViewer = timingSafeEqual(suppliedHash, hash(viewer ?? '')) && !!viewer;
  const isSuper = timingSafeEqual(suppliedHash, hash(superAdmin ?? '')) && !!superAdmin;
  // A coinciding configuration must never elevate the read-only credential.
  if (isViewer) return 'viewer';
  if (isAdmin) return 'admin';
  if (isSuper) return 'super';
  return null;
}

export function authorizeStaff(request: Request, permission: 'admin' | 'view' | 'super' = 'admin'): Response | null {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  if (!process.env.MATRICULA_EXPORT_TOKEN && !process.env.MATRICULA_VIEW_TOKEN && !process.env.MATRICULA_SUPER_TOKEN) {
    return Response.json({ error: 'Acceso de personal no habilitado por administración.' }, { status: 503, headers });
  }
  const role = staffRole(request);
  if (!role) return Response.json({ error: 'Acceso no autorizado.' }, { status: 401, headers });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
  if (permission === 'super' && role !== 'super') return Response.json({ error: 'Acceso exclusivo de super administración.' }, { status: 403, headers });
  if (permission === 'admin' && role !== 'admin' && role !== 'super') {
    return Response.json({ error: 'Este acceso solo permite ver fichas.' }, { status: 403, headers });
  }
  return null;
}

