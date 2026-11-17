import { createHash } from 'node:crypto';
import { authorizeStaff } from '@/lib/matricula/access';
import { getSql } from '@/lib/matricula/db';
import { databaseSchema, tableName } from '@/lib/matricula/target';
export const runtime = 'nodejs';
// Read-only diagnostic, never available in Production. Returns no enrollment data or credentials.
export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview') return new Response(null, {status:404});
  const denied = authorizeStaff(request);
  if (denied) return denied;
  let body;
  try { body = await request.json() as {id?: unknown}; } catch { return Response.json({error:'Solicitud inválida.'},{status:400}); }
  if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return Response.json({error:'Comprobante inválido.'},{status:400});
  try {
    const sql = getSql();
    const target = databaseSchema();
    const current = await sql.query(`SELECT EXISTS(SELECT 1 FROM ${tableName(target)} WHERE id=$1) AS present`, [body.id]);
    const publicTable = await sql.query("SELECT to_regclass('public.matriculas_2027') IS NOT NULL AS present");
    const production = publicTable[0].present ? await sql.query('SELECT EXISTS(SELECT 1 FROM public.matriculas_2027 WHERE id=$1) AS present', [body.id]) : [{present:false}];
    const url = new URL(process.env.MATRICULA_DATABASE_URL!);
    return Response.json({environment:'preview', schema:target, productionSchema:'public', inPreview:current[0].present, inProductionNamespace:production[0].present, productionTableExists:publicTable[0].present, endpointFingerprint:createHash('sha256').update(`${url.hostname}${url.pathname}`).digest('hex')}, {headers:{'Cache-Control':'private, no-store'}});
  } catch { return Response.json({error:'No se pudo comprobar el aislamiento.'},{status:503}); }
}
