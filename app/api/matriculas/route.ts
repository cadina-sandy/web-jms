import { validate } from '@/lib/matricula/validation';
import { markReceiptSent, save } from '@/lib/matricula/db';
import { sendEnrollmentReceipt } from '@/lib/matricula/receipt';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Se requiere JSON.' }, { status: 415 });
  const raw = await request.text();
  if (raw.length > 200_000) return Response.json({ error: 'Ficha demasiado grande.' }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const { answers, errors } = validate(body?.answers);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });
  if (typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) return Response.json({ error: 'Identificador inválido.' }, { status: 400 });
  try {
    const result = await save(answers, body.id);
    const receiptEmail = await sendEnrollmentReceipt(result.id, result.receipt);
    if (receiptEmail === 'sent' && !result.receipt.sent) {
      try {
        await markReceiptSent(result.id);
      } catch {
        console.error('No se pudo registrar el envío del comprobante (sin datos personales).');
      }
    }
    return Response.json(
      { id: result.id, created: result.created, receiptEmail },
      { status: result.created ? 201 : 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    console.error('No se pudo guardar matrícula (sin datos personales).');
    return Response.json({ error: 'No se pudo guardar. Conservamos tu ficha; intenta nuevamente.' }, { status: 503 });
  }
}
