import { createHash, timingSafeEqual } from 'node:crypto';
import { authorizeStaff, staffRole } from '@/lib/matricula/access';
import { getSql, quote, readEnrollmentColumn } from '@/lib/matricula/db';
import { fields } from '@/lib/matricula/fields';
import { databaseSchema, tableName } from '@/lib/matricula/target';
import { ensureHistoryStorage, historyTable, recordHistory } from '@/lib/matricula/history';
import { prepareEnrollmentEdit } from '@/lib/matricula/edit';
export const runtime='nodejs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function readBody(request:Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error();
  const reader=request.body?.getReader();if(!reader)throw new Error();const decoder=new TextDecoder();let text='',size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>450000){await reader.cancel();throw new Error();}text+=decoder.decode(chunk.value,{stream:true});}
  const body=JSON.parse(text+decoder.decode());if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();return body as Record<string,unknown>;
}
async function current(id:string) {
  const [row]=await getSql().query(`SELECT ${['id','numero_ficha',...fields].map(readEnrollmentColumn).join(',')}, md5(to_jsonb(enrollment)::text) AS edit_version FROM ${tableName(databaseSchema())} AS enrollment WHERE id=$1 AND deleted_at IS NULL`,[id]);
  if(!row)return null;const {edit_version,...record}=row;return {record,version:String(edit_version)};
}
export async function POST(request:Request) {
  const denied=authorizeStaff(request,'admin');if(denied)return denied;
  let body:Record<string,unknown>;try{body=await readBody(request);}catch{return Response.json({error:'Solicitud inválida.'},{status:400,headers});}
  if(typeof body.id!=='string'||!uuid.test(body.id))return Response.json({error:'Ficha inválida.'},{status:400,headers});
  try{await ensureHistoryStorage();const result=await current(body.id);if(!result)return Response.json({error:'La ficha no está disponible para edición.'},{status:404,headers});await recordHistory('abrir_edicion',staffRole(request)!,[body.id]);return Response.json(result,{headers});}
  catch{return Response.json({error:'No se pudo abrir la edición. Intenta nuevamente.'},{status:503,headers});}
}
export async function PATCH(request:Request) {
  const denied=authorizeStaff(request,'admin');if(denied)return denied;
  let body:Record<string,unknown>;try{body=await readBody(request);}catch{return Response.json({error:'Solicitud inválida.'},{status:400,headers});}
  const {id,version,editor,confirmationPassword,changes}=body;
  if(typeof id!=='string'||!uuid.test(id)||typeof version!=='string'||! /^[0-9a-f]{32}$/.test(version)||typeof editor!=='string'||editor.trim().length<2||editor.trim().length>100||/[\u0000-\u001f\u007f]/.test(editor))return Response.json({error:'Indica una ficha válida y tu nombre completo.'},{status:400,headers});
  const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  const hash=(value:string)=>createHash('sha256').update(value).digest();
  if(typeof confirmationPassword!=='string'||confirmationPassword.length>512||!timingSafeEqual(hash(confirmationPassword),hash(supplied)))return Response.json({error:'Repite la misma clave con la que ingresaste.'},{status:403,headers});
  try {
    await ensureHistoryStorage();const original=await current(id);
    if(!original)return Response.json({error:'La ficha ya no está disponible para editar.'},{status:404,headers});
    if(original.version!==version)return Response.json({error:'La ficha cambió desde que la abriste. Vuelve al listado y abre la versión actual antes de editar.'},{status:409,headers});
    const prepared=prepareEnrollmentEdit(original.record,changes);
    if(Object.keys(prepared.errors).length)return Response.json({error:'Revisa los datos indicados.',errors:prepared.errors},{status:400,headers});
    if(!prepared.changes.length)return Response.json({error:'No hay cambios para guardar.'},{status:400,headers});
    const table=tableName(databaseSchema()); const keys=prepared.changes.map(c=>c.field);
    const parameters=[id,version,...prepared.changes.map(c=>c.after),staffRole(request)!,JSON.stringify({editor:editor.trim(),changes:prepared.changes})];
    const actorIndex=3+keys.length,detailsIndex=actorIndex+1;
    // Lock, compare, update only the changed fields, and audit in one atomic statement.
    const rows=await getSql().query(`WITH prior AS MATERIALIZED (SELECT enrollment.* FROM ${table} AS enrollment WHERE id=$1 AND deleted_at IS NULL FOR UPDATE),
      changed AS (UPDATE ${table} AS enrollment SET ${keys.map((key,i)=>`${quote(key)}=$${i+3}`).join(',')}
        FROM prior WHERE enrollment.id=prior.id AND md5(to_jsonb(prior)::text)=$2 RETURNING enrollment.id,enrollment.numero_ficha),
      logged AS (INSERT INTO ${historyTable(databaseSchema())} (action,actor,record_ids,details)
        SELECT 'editar',$${actorIndex},ARRAY[id],$${detailsIndex}::jsonb || jsonb_build_object('numbers',jsonb_build_array(numero_ficha::text)) FROM changed RETURNING event_id)
      SELECT id FROM changed WHERE EXISTS(SELECT 1 FROM logged)`,parameters);
    if(!rows.length)return Response.json({error:'La ficha fue modificada o enviada a papelera mientras editabas. No se guardó ningún cambio. Vuelve a abrirla.'},{status:409,headers});
    return Response.json({id,changed:prepared.changes.length},{headers});
  }catch{return Response.json({error:'No se pudo confirmar el guardado. Vuelve a consultar la ficha antes de reintentar.'},{status:503,headers});}
}
