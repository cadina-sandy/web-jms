'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { fields, type Answers, type Field } from '@/lib/matricula/fields';
import { labels } from '@/lib/matricula/labels';
import { completeEmail, emailEdit, editGroups, editOptions, prepareEnrollmentEdit, showEditField } from '@/lib/matricula/edit';
import { enrollmentDate, enrollmentName, enrollmentNumber, type EnrollmentRecord } from '@/lib/matricula/view';

export default function EnrollmentEditor({record,version,token,onCancel,onSaved}:{record:EnrollmentRecord;version:string;token:string;onCancel:()=>void;onSaved:(id:string)=>Promise<void>}) {
  const [draft,setDraft]=useState<Answers>({...record});const [editor,setEditor]=useState('');const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [errors,setErrors]=useState<Record<string,string>>({});
  const heading=useRef<HTMLHeadingElement>(null);const form=useRef<HTMLFormElement>(null);
  useEffect(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'start'});},[]);
  const patch=Object.fromEntries(fields.filter(key=>(draft[key]||'')!==(record[key]||'')).map(key=>[key,draft[key]||'']));
  const prepared=prepareEnrollmentEdit(record,patch);
  function change(field:Field,value:string){setDraft(current=>({...current,[field]:value}));setErrors({});setMessage('');}
  function changeEmail(guardian:boolean,value:string){const original=completeEmail(record,guardian);setDraft(current=>({...current,...(value===original?guardian?{apoderadoCorreoUsuario:record.apoderadoCorreoUsuario,apoderadoCorreoDominio:record.apoderadoCorreoDominio,apoderadoCorreoDominioOtro:record.apoderadoCorreoDominioOtro}:{correoUsuario:record.correoUsuario,correoDominio:record.correoDominio,correoDominioOtro:record.correoDominioOtro}:emailEdit(value,guardian))}));setErrors({});setMessage('');}
  function cancel(){if(busy)return;if(prepared.changes.length&&!window.confirm('¿Salir sin guardar los cambios de esta ficha?'))return;setPassword('');onCancel();}
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(busy)return;setMessage('');
    if(Object.keys(prepared.errors).length){setErrors(prepared.errors);setMessage('Revisa los campos indicados antes de guardar.');setTimeout(()=>{const invalid=form.current?.querySelector<HTMLElement>('[aria-invalid="true"]');invalid?.closest('details')?.setAttribute('open','');invalid?.focus();},0);return;}
    if(!prepared.changes.length){setMessage('No hay cambios para guardar.');return;}
    if(password!==token){setMessage('Repite la misma clave con la que ingresaste.');setPassword('');return;}
    setBusy(true);
    try {
      const response=await fetch('/api/matriculas/editar/',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},cache:'no-store',body:JSON.stringify({id:record.id,version,editor,confirmationPassword:password,changes:patch})});
      const result=await response.json() as {error?:string;errors?:Record<string,string>};setPassword('');
      if(!response.ok){setErrors(result.errors||{});setMessage(result.error||'No se pudo guardar la ficha.');return;}
      await onSaved(record.id);
    }catch{setPassword('');setMessage('No se pudo confirmar el guardado. Consulta la ficha antes de volver a intentarlo.');}
    finally{setBusy(false);}
  }
  return <section className="enrollment-editor" aria-labelledby="edit-title">
    <h2 id="edit-title" ref={heading} tabIndex={-1}>Editar ficha N° {enrollmentNumber(record)}</h2>
    <p><strong>{enrollmentName(record)}</strong> · Fecha de inscripción: {enrollmentDate(record.fechaMatricula||'')} (se conserva).</p>
    <p>Corrige únicamente los datos necesarios. Se guardará sobre esta misma ficha, con registro de cada cambio.</p>
    <form ref={form} onSubmit={save}>
      <fieldset disabled={busy} className="enrollment-editor-fields">
        <legend className="sr-only">Datos editables de la ficha</legend>
        {editGroups.map(([start,title],index)=>{
          const next=editGroups[index+1]?.[0];const group=fields.slice(fields.indexOf(start),next?fields.indexOf(next):fields.length).filter(field=>showEditField(field,draft));
          return <details key={start} open={index===0||index===1}><summary>{title}</summary><div className="enrollment-editor-grid">{group.map(field=>{
            const email=field==='correoUsuario'||field==='apoderadoCorreoUsuario';const guardian=field==='apoderadoCorreoUsuario';const options=editOptions(field);const value=draft[field]||'';
            const label=email?(guardian?'Correo del apoderado (completo)':'Correo del estudiante (completo, opcional)'):labels[field];
            const invalid=!!errors[field];const props={id:`edit-${field}`,name:field,'aria-invalid':invalid,'aria-describedby':invalid?`edit-error-${field}`:undefined};
            return <label key={field} htmlFor={`edit-${field}`}>{label}
              {email?<input {...props} type="email" autoCapitalize="none" autoComplete="off" maxLength={254} value={completeEmail(draft,guardian)} onChange={event=>changeEmail(guardian,event.target.value)}/>:options?<select {...props} value={value} onChange={event=>change(field,event.target.value)}><option value="">Selecciona una opción</option>{value&&!options.some(([key])=>key===value)&&<option value={value}>{value} (dato guardado)</option>}{options.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>:<input {...props} type={field==='fechaNacimiento'||field==='apoderadoFechaNacimiento'?'date':'text'} inputMode={/Celular|Telefono|Numero$|^ipe$|Ipa$/.test(field)?'numeric':undefined} maxLength={2000} value={value} onChange={event=>change(field,event.target.value)}/>}
              {invalid&&<span className="enrollment-editor-error" id={`edit-error-${field}`}>{errors[field]}</span>}
            </label>;
          })}</div></details>;
        })}
      </fieldset>
      {Object.keys(errors).length>0&&<div className="enrollment-editor-error" role="alert"><p>Revisa estos datos:</p><ul>{Object.entries(errors).map(([key,error])=><li key={key}>{labels[key]||key}: {error}</li>)}</ul></div>}
      <section className="enrollment-editor-confirm" aria-labelledby="confirm-edit-title">
        <h3 id="confirm-edit-title">Revisar y guardar cambios</h3>
        {prepared.changes.length?<><p>{prepared.changes.length} campo(s) modificado(s), incluidos los datos dependientes que correspondan.</p><div className="enrollment-editor-scroll"><table><caption>Resumen antes de guardar</caption><thead><tr><th scope="col">Campo</th><th scope="col">Antes</th><th scope="col">Después</th></tr></thead><tbody>{prepared.changes.map(c=><tr key={c.field}><th scope="row">{labels[c.field]}</th><td>{c.before||'Sin dato'}</td><td>{c.after||'Sin dato'}</td></tr>)}</tbody></table></div></>:<p>Aún no has modificado ningún dato.</p>}
        <div className="enrollment-editor-grid"><label>Nombre completo de quien realiza el cambio<input name="editor" required minLength={2} maxLength={100} autoComplete="name" value={editor} disabled={busy} onChange={event=>setEditor(event.target.value)}/></label><label>Confirma la misma clave con la que ingresaste<input name="confirmationPassword" type="password" required maxLength={512} autoComplete="off" value={password} disabled={busy} onChange={event=>setPassword(event.target.value)}/></label></div>
        <p>El nombre declarado, los campos anteriores y nuevos, y la fecha del cambio quedarán en el historial de Super sayayin. La fecha de inscripción, el número de ficha y el responsable original se conservan.</p>
        {message&&<p role="status">{message}</p>}
        <div className="enrollment-admin-actions"><button className="enrollment-admin-primary" type="submit" disabled={busy||!prepared.changes.length}>{busy?'Guardando…':'Guardar cambios'}</button><button type="button" disabled={busy} onClick={cancel}>Cancelar edición</button></div>
      </section>
    </form>
  </section>;
}
