import { isEnrollmentClick } from '@/lib/matricula/click-events';
import { recordEnrollmentClick } from '@/lib/matricula/click-stats';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return new Response(null, { status: 415, headers });
  // Bound both advertised and streamed body sizes before parsing.
  if (Number(request.headers.get('content-length') || 0) > 512) return new Response(null, { status: 413, headers });
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    let text = ''; let bytes = 0; const decoder = new TextDecoder();
    while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.byteLength; if (bytes > 512) { await reader.cancel(); return new Response(null, { status: 413, headers }); } text += decoder.decode(chunk.value, { stream: true }); }
    body = JSON.parse(text + decoder.decode());
  } catch { return new Response(null, { status: 400, headers }); }
  if (!isEnrollmentClick(body)) return new Response(null, { status: 400, headers });
  try { await recordEnrollmentClick(body.event,body.id); return new Response(null, { status: 204, headers }); }
  catch { return new Response(null, { status: 503, headers }); }
}
