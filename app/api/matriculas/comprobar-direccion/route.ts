import { checkAddress } from '@/lib/matricula/address';

const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return Response.json({ error: 'Origen no permitido.' }, { status: 403, headers });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'Se requiere JSON.' }, { status: 415, headers });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) return Response.json({ error: 'Comprobación no disponible.' }, { status: 503, headers });

  const raw = await request.text();
  if (raw.length > 2048) return Response.json({ error: 'Consulta demasiado grande.' }, { status: 413, headers });
  let body: { address?: unknown; commune?: unknown } | null;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'JSON inválido.' }, { status: 400, headers });
  }
  const address = typeof body?.address === 'string' ? body.address.trim() : '';
  const commune = typeof body?.commune === 'string' ? body.commune.trim() : '';
  if (!address || !commune || address.length > 160 || commune.length > 80) {
    return Response.json({ error: 'Se requieren calle, número y comuna.' }, { status: 400, headers });
  }

  const found = await checkAddress(address, commune, apiKey);
  if (found === null) return Response.json({ error: 'Comprobación no disponible.' }, { status: 503, headers });
  return Response.json({ found }, { headers });
}
