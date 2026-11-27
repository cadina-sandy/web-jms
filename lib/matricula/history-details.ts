import { labels } from './labels';
export type AuditChange={field:string;before:string;after:string};
export function auditChanges(details:Record<string,unknown>): AuditChange[] {
  return Array.isArray(details.changes)?details.changes.filter((value): value is AuditChange=>!!value&&typeof value==='object'&&typeof value.field==='string'&&Object.hasOwn(labels,value.field)&&typeof value.before==='string'&&typeof value.after==='string'):[];
}
export function editHistoryText(details:Record<string,unknown>) {
  return [typeof details.editor==='string'?`Nombre declarado: ${details.editor}`:'',...auditChanges(details).map(c=>`${labels[c.field]}: «${c.before||'Sin dato'}» → «${c.after||'Sin dato'}»`)].filter(Boolean).join(' · ');
}
