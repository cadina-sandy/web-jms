import { fields, enrollmentCourses, type Answers, type Field } from './fields';
import { validate } from './validation';

// Original registration metadata and its responsible person are not editable.
export const protectedEditFields = new Set<string>(['fechaMatricula','comprobacionDireccion','matriculaRol','funcionarioMatricula','funcionarioMatriculaOtro']);
export const editableFields = fields.filter(field => !protectedEditFields.has(field));
export type FieldChange = { field: Field; before: string; after: string };
export const editGroups = [
  ['curso','Inscripción'], ['nombres','Datos del estudiante'], ['apoderadoNombres','Apoderado principal'],
  ['apoderadoSuplenteAplica','Apoderado suplente'], ['emergenciaContacto','Emergencia'], ['retiroCantidad','Personas autorizadas para retiro'],
  ['saludTipoPrevision','Salud'], ['estudianteNuevo','Antecedentes escolares'], ['autorizacionImagenDecision','Autorización de imagen'],
] as const;
const yesNo = [['si','Sí'],['no','No']];
const guardianSource = [['apoderado','Apoderado principal'],['apoderado-suplente','Apoderado suplente']];
const range = (n: number) => Array.from({length:n},(_,i)=>[String(i+1),String(i+1)]);
export function editOptions(field: string): string[][] | undefined {
  if (field==='curso') return enrollmentCourses.map(value=>[value,value]);
  if (/^(vive\d|pertenecePuebloOriginario|apoderadoRegistroSocialHogares|saludTieneDiagnostico|saludImpedimentoEducacionFisica|estudianteNuevo|cursoRepetido|autorizacionImagenDecision)$/.test(field)) return yesNo;
  if (/TipoIdentificacion$|^tipoIdentificacion$/.test(field)) return [['rut','RUT'],[field==='tipoIdentificacion'?'ipe':'ipa',field==='tipoIdentificacion'?'IPE':'IPA']];
  if (field==='genero') return [['femenino','Femenino'],['masculino','Masculino'],['no-binario','No binario'],['prefiero-no-responder','Prefiero no responder']];
  if (field==='apoderadoSuplenteAplica') return [['si','Sí'],['no-aplica','No aplica: sin suplente']];
  if (field==='numeroPersonasHogar'||field==='retiroCantidad') return range(10);
  if (field==='cantidadCursosRepetidos') return [...range(4),['mas-de-4','Más de 4']];
  if (field==='emergenciaContacto'||/^retiro\d+Origen$/.test(field)) return [...guardianSource,['otro','Otra persona']];
  if (field==='autorizacionImagenApoderado') return guardianSource;
  if (field==='saludTipoPrevision') return [['no-aplica','Sin previsión'],['fonasa','Fonasa'],['isapre','Isapre'],['otra','Otra']];
  if (field==='saludConsultorio') return [['no-aplica','Sin consultorio'],['felix-de-amesti','Dr. Félix de Amesti'],['padre-alberto-hurtado','Padre Alberto Hurtado'],['santa-julia','Santa Julia'],['centro-privado','Centro Privado'],['otro','Otro']];
  if (field==='programaApoyoFamiliar') return [['no-aplica','Ningún programa'],...['PRM','PPF','FAE','PIE'].map(v=>[v,v])];
  if (field==='apoderadoSituacionLaboral') return [...['Dueña de casa','Trabajador independiente','Trabajador dependiente'].map(v=>[v,v]),['no-aplica','Sin actividad laboral']];
  if (field==='apoderadoLugarTrabajo') return [['Fuera de casa','Fuera de casa'],['Desde la casa','Desde la casa'],['no-aplica','No aplica']];
  if (field==='apoderadoNivelEducacion') return ['No aplica: sin escolaridad','Básica','Media / Científico-Humanista','Media / Técnico','Técnico nivel superior','Universidad incompleta','Universidad completa','Máster / Magíster','Doctorado'].map(v=>[v,v]);
}
const details: Record<string,[Field,string]> = {
  saludOtraPrevision:['saludTipoPrevision','otra'], saludDetalleDiagnostico:['saludTieneDiagnostico','si'],
  saludOtroConsultorio:['saludConsultorio','otro'], cantidadCursosRepetidos:['cursoRepetido','si'], colegioProcedencia:['estudianteNuevo','si'],
};
export function showEditField(field: Field, record: Answers) {
  if (protectedEditFields.has(field)) return false;
  if (/CorreoDominio|^correoDominio/.test(field)) return false; // Presented as one complete email.
  if (details[field]) return record[details[field][0]]===details[field][1] || !!record[field];
  if (field.startsWith('apoderadoSuplente') && field!=='apoderadoSuplenteAplica' && record.apoderadoSuplenteAplica!=='si') return false;
  const pickup=/^retiro(\d+)(.+)$/.exec(field);
  if (pickup) {
    if (+pickup[1]>+(record.retiroCantidad||1)) return false;
    if (pickup[2]!=='Origen' && record[`retiro${pickup[1]}Origen` as Field]!=='otro') return false;
  }
  if (field==='emergenciaContactoOtro') return record.emergenciaContacto==='otro';
  const id=/^(apoderadoSuplente|apoderado|retiro\d+)?(RutNumero|RutDigito|Ipa|IpaDigito)$/.exec(field);
  if (id) { const choice=record[`${id[1]||''}TipoIdentificacion` as Field]; return !choice || (id[2].startsWith('Rut') ? choice==='rut' : choice==='ipa'); }
  if (field==='rutNumero'||field==='rutDigito') return !record.tipoIdentificacion||record.tipoIdentificacion==='rut';
  if (field==='ipe'||field==='ipeDigito') return record.tipoIdentificacion==='ipe';
  return true;
}
export function completeEmail(record: Answers, guardian: boolean) {
  const user=guardian?record.apoderadoCorreoUsuario:record.correoUsuario;
  const domain=guardian?record.apoderadoCorreoDominio:record.correoDominio;
  const other=guardian?record.apoderadoCorreoDominioOtro:record.correoDominioOtro;
  return user ? `${user}@${domain==='otra'?other||'':domain||''}` : '';
}
export function emailEdit(email: string, guardian: boolean): Answers {
  const at=email.lastIndexOf('@');const user=at<0?email:email.slice(0,at);const domain=at<0?'':email.slice(at+1).toLowerCase();
  return guardian ? {apoderadoCorreoUsuario:user,apoderadoCorreoDominio:email?'otra':'',apoderadoCorreoDominioOtro:domain}
    : {correoUsuario:user,correoDominio:email?'otra':'',correoDominioOtro:domain};
}

export function prepareEnrollmentEdit(original: Answers, patch: unknown): { values: Answers; changes: FieldChange[]; errors: Record<string,string> } {
  const errors: Record<string,string>={}; const values: Answers={};
  if (!patch || typeof patch!=='object' || Array.isArray(patch)) return {values,changes:[],errors:{form:'Cambios inválidos.'}};
  for (const [key,value] of Object.entries(patch)) {
    if (!editableFields.includes(key as Field)) { errors[key]='Este dato no se puede modificar.';continue; }
    if (typeof value!=='string'||value.length>2000||/[\u0000]/.test(value)) {errors[key]='Revisa este dato (máximo 2000 caracteres).';continue;}
    const field=key as Field; const text=value.trim(); const options=editOptions(field);
    if (text && options && !options.some(([option])=>option===text) && text!==(original[field]||'')) errors[field]='Selecciona una opción válida.';
    if (text!==(original[field]||'')) values[field]=text;
  }
  const merged={...original,...values}; const baseline=validate(original);const checked=validate(merged);
  for (const key of Object.keys(values) as Field[]) values[key]=checked.answers[key]??values[key];
  // Derived/conditional fields change only when one of their controlling fields changes.
  for (const [detail,[control]] of Object.entries(details)) if (control in values) values[detail as Field]=checked.answers[detail as Field]||'';
  if ('apoderadoSuplenteAplica' in values && merged.apoderadoSuplenteAplica!=='si') for (const key of fields) if(key.startsWith('apoderadoSuplente')&&key!=='apoderadoSuplenteAplica')values[key]='';
  for (let i=1;i<=10;i++) {
    const prefix=`retiro${i}`;const source=merged[`${prefix}Origen` as Field];
    const guardian=source==='apoderado'?'apoderado':source==='apoderado-suplente'?'apoderadoSuplente':null;
    if ('retiroCantidad' in values || `${prefix}Origen` in values || (guardian && Object.keys(values).some(k=>k.startsWith(guardian)))) {
      for (const key of fields) if (key.startsWith(prefix)&&key!==`${prefix}Origen`)values[key]=checked.answers[key]||'';
      if (i>+(merged.retiroCantidad||1)) values[`${prefix}Origen` as Field]='';
    }
  }
  if ('direccion' in values || 'comuna' in values) values.comprobacionDireccion='';
  const final=validate({...original,...values});
  // Historic, incomplete fichas can be corrected without rewriting unrelated old data.
  for (const [key,error] of Object.entries(final.errors)) {
    if (protectedEditFields.has(key)) continue;
    if (key in values || error!==baseline.errors[key] || (key==='conQuienVive'&&Object.keys(values).some(k=>/^vive\d$/.test(k)))) errors[key]=error;
  }
  const changes=fields.flatMap(field=>field in values && (original[field]||'')!==(values[field]||'') ? [{field,before:original[field]||'',after:values[field]||''}] : []);
  return {values:Object.fromEntries(changes.map(c=>[c.field,c.after])),changes,errors};
}
