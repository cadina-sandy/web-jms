import { createHash } from 'node:crypto';
import { validateHelpRequest } from '@/lib/matricula/help';
import { sendHelpRequest } from '@/lib/matricula/help-mail';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const attempts = new Map<string, { count: number; expires: number }>();
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Solicitud inválida.' }, { status: 415, headers });
  const raw = await request.text();
  if (raw.length > 6000) return Response.json({ error: 'La consulta es demasiado larga.' }, { status: 413, headers });
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400, headers }); }
  const { value, errors } = validateHelpRequest(input);
  if (Object.keys(errors).length) return Response.json({ error: 'Revisa los campos indicados.', errors }, { status: 422, headers });
  // Honeypot: do not deliver automated form submissions.
  if (value.website) return Response.json({ ok: true }, { headers });
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  const key = createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown').digest('hex');
  const attempt = attempts.get(key) ?? { count: 0, expires: now + 15 * 60 * 1000 };
  if (attempt.count >= 3 || (!attempts.has(key) && attempts.size >= 1000)) return Response.json({ error: 'Has enviado varias consultas. Intenta nuevamente en 15 minutos.' }, { status: 429, headers: { ...headers, 'Retry-After': '900' } });
  attempt.count++; attempts.set(key, attempt);
  if (!await sendHelpRequest(value)) return Response.json({ error: 'No pudimos enviar tu consulta. Tus datos siguen aquí; intenta nuevamente o escribe a matriculas.jms@gmail.com.' }, { status: 503, headers });
  return Response.json({ ok: true }, { headers });
}
