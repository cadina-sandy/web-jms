'use client';
import { useState, type FormEvent } from 'react';
import { historyActions, historyActors, type HistoryAction } from '@/lib/matricula/history-actions';
import { enrollmentName, enrollmentSections, type EnrollmentRecord } from '@/lib/matricula/view';
type AuditEvent = { event_id: string; occurred_at: string; action: HistoryAction; actor: string; record_ids: string[]; details: Record<string, unknown> };
type TrashRecord = EnrollmentRecord & { deleted_at: string; deleted_by: string };
const dateTime = (value: string) => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
export default function SuperAdmin() {
  const [token,setToken] = useState(''); const [authorized,setAuthorized] = useState(false);
  const [tab,setTab] = useState<'history'|'trash'>('history'); const [busy,setBusy] = useState(false); const [message,setMessage] = useState('');
  const [from,setFrom] = useState(''); const [to,setTo] = useState(''); const [action,setAction] = useState(''); const [id,setId] = useState('');
  const [events,setEvents] = useState<AuditEvent[]>([]); const [trash,setTrash] = useState<TrashRecord[]>([]);
  const [record,setRecord] = useState<TrashRecord|null>(null); const [offset,setOffset] = useState(0); const [more,setMore] = useState(false);
  function logout() { setToken('');setAuthorized(false);setEvents([]);setTrash([]);setRecord(null);setMessage('');setOffset(0);setMore(false); }
  async function request(body: object, method='POST') {
    const response = await fetch('/api/matriculas/historial/', { method, headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(body),cache:'no-store' });
    if (!response.ok) { const error=await response.json().catch(()=>null); if(response.status===401||response.status===403)logout(); throw new Error(error?.error||'No se pudo completar la solicitud.'); }
    return response;
  }
  async function load(nextTab=tab,nextOffset=0) {
    if(busy||!token)return;setBusy(true);setMessage('');setRecord(null);
    try {const response=await request({mode:nextTab,offset:nextOffset,...(nextTab==='history'?{from,to,action,id}:{})});const result=await response.json();setAuthorized(true);setTab(nextTab);setOffset(nextOffset);setMore(result.hasMore);setEvents(result.events??[]);setTrash(result.records??[]);}catch(error){setMessage(error instanceof Error?error.message:'No se pudo consultar.');}finally{setBusy(false);}
  }
  async function inspect(row:TrashRecord) {if(busy)return;setBusy(true);setMessage('');try{const response=await request({mode:'record',id:row.id});setRecord((await response.json()).record);}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}
  async function change(row:TrashRecord,kind:'restore'|'purge') {
    if(busy)return;
    if(kind==='purge' && window.prompt(`Borrar definitivamente la ficha de ${enrollmentName(row)} (${row.id}).\nEsta acción no se puede deshacer. Escribe ELIMINAR para confirmar.`)!=='ELIMINAR')return;
    if(kind==='restore'&&!window.confirm(`¿Restaurar la ficha de ${enrollmentName(row)} al listado activo?`))return;
    setBusy(true);setMessage('');
    try {await request({id:row.id,action:kind,...(kind==='purge'?{confirmation:'ELIMINAR',confirmedId:row.id}:{})},'PATCH');setRecord(null);setTrash(current=>current.filter(item=>item.id!==row.id));setMessage(kind==='purge'?'Borrado definitivo confirmado y registrado.':'Ficha restaurada y registrada.');}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}
  }
  async function download() {if(busy)return;setBusy(true);setMessage('');try{const response=await request({mode:'csv',from,to,action,id});const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download='historial-matriculas.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}
  function login(event:FormEvent<HTMLFormElement>){event.preventDefault();void load('history');}
  return <main className="shell enrollment-admin super-admin">
    <h1>Admin super sayayin</h1><p className="enrollment-admin-intro">Historial de fichas y confirmación de borrados. Acceso exclusivo de super administración.</p>
    <form className="enrollment-admin-controls" onSubmit={login}><label>Tu clave exclusiva<input type="password" required autoComplete="off" value={token} disabled={busy} onChange={event=>{setToken(event.target.value);setAuthorized(false);setEvents([]);setTrash([]);setRecord(null);}} /></label><div className="enrollment-admin-actions"><button type="submit" disabled={busy||!token}>{busy?'Consultando…':'Entrar'}</button>{authorized&&<button type="button" disabled={busy} onClick={logout}>Cerrar sesión</button>}</div></form>
    {message&&<p role="status">{message}</p>}
    {authorized&&<>
      <nav className="enrollment-admin-actions" aria-label="Secciones de super administración"><button type="button" aria-current={tab==='history'?'page':undefined} disabled={busy} onClick={()=>load('history')}>Historial</button><button type="button" aria-current={tab==='trash'?'page':undefined} disabled={busy} onClick={()=>load('trash')}>Papelera</button></nav>
      {tab==='history'?<section className="enrollment-admin-results"><h2>Historial de acciones</h2><p>Se registran las acciones desde la activación de este historial. La identidad corresponde al perfil de la clave utilizada.</p>
        <div className="super-filters"><label>Desde<input type="date" value={from} disabled={busy} onChange={event=>setFrom(event.target.value)}/></label><label>Hasta<input type="date" value={to} disabled={busy} onChange={event=>setTo(event.target.value)}/></label><label>Acción<select value={action} disabled={busy} onChange={event=>setAction(event.target.value)}><option value="">Todas</option>{Object.entries(historyActions).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Comprobante de ficha<input value={id} placeholder="Opcional: identificador de ficha" disabled={busy} onChange={event=>setId(event.target.value)}/></label></div>
        <div className="enrollment-admin-actions"><button type="button" disabled={busy} onClick={()=>load('history')}>Aplicar filtros</button><button type="button" disabled={busy} onClick={download}>Descargar historial CSV</button></div>
        <div className="super-table-scroll"><table><caption>Acciones registradas · Horario de Chile</caption><thead><tr><th scope="col">Fecha y hora</th><th scope="col">Acción</th><th scope="col">Perfil</th><th scope="col">Fichas y detalles</th></tr></thead><tbody>{events.map(event=><tr key={event.event_id}><td>{dateTime(event.occurred_at)}</td><td>{historyActions[event.action]??event.action}</td><td>{historyActors[event.actor]??event.actor}</td><td>{event.record_ids.length?event.record_ids.join(', '):'—'}{Object.keys(event.details).length>0&&<small>{[event.details.count != null ? `Cantidad: ${event.details.count}` : '', event.details.course ? `Curso: ${event.details.course}` : ''].filter(Boolean).join(' · ') || 'Acción registrada'}</small>}</td></tr>)}</tbody></table></div>{!events.length&&<p>Aún no hay acciones para estos filtros.</p>}
      </section>:<section className="enrollment-admin-results"><h2>Papelera de fichas</h2><p>Estas fichas conservan sus datos. Puedes restaurarlas o revisar cada ficha antes de confirmar su eliminación definitiva.</p>
        {record?<article className="enrollment-record"><h2>{enrollmentName(record)}</h2><p>Comprobante: {record.id} · Enviada a papelera: {dateTime(record.deleted_at)}</p>{enrollmentSections(record).map(section=><section className="enrollment-record-section" key={section.title}><h3>{section.title}</h3><dl>{section.entries.map(entry=><div key={entry.key}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></section>)}<div className="enrollment-admin-actions"><button type="button" disabled={busy} onClick={()=>setRecord(null)}>Volver a papelera</button><button type="button" disabled={busy} onClick={()=>change(record,'restore')}>Restaurar ficha</button><button type="button" className="super-danger" disabled={busy} onClick={()=>change(record,'purge')}>Confirmar borrado definitivo</button></div></article>:<ul className="enrollment-admin-list">{trash.map(row=><li key={row.id}><div><strong>{enrollmentName(row)}</strong><span>{row.curso} · {dateTime(row.deleted_at)}</span><small>{row.id}</small></div><button type="button" disabled={busy} onClick={()=>inspect(row)}>Revisar ficha</button></li>)}</ul>}{!record&&!trash.length&&<p>La papelera está vacía.</p>}
      </section>}
      {!record&&<div className="enrollment-admin-actions"><button type="button" disabled={busy||offset===0} onClick={()=>load(tab,Math.max(0,offset-(tab==='history'?50:25)))}>Anterior</button><button type="button" disabled={busy||!more} onClick={()=>load(tab,offset+(tab==='history'?50:25))}>Siguiente</button></div>}
    </>}
  </main>;
}
