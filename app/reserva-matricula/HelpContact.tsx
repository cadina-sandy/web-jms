'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { helpQuestionLimit, validateHelpRequest } from '@/lib/matricula/help';

export default function HelpContact() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dock = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  function close() { setOpen(false); trigger.current?.focus(); }
  useEffect(() => {
    if (!open) return;
    name.current?.focus();
    function keydown(event: KeyboardEvent) { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }
    function outside(event: PointerEvent) { if (dock.current && !dock.current.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  useEffect(() => { if (sent && open) result.current?.focus(); }, [sent, open]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || sent) return;
    const data = new FormData(event.currentTarget);
    const { value, errors: nextErrors } = validateHelpRequest(Object.fromEntries(data));
    setErrors(nextErrors); setError('');
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/matriculas/ayuda/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value), cache: 'no-store' });
      const reply = await response.json() as { ok?: boolean; error?: string; errors?: Record<string, string> };
      if (!response.ok || !reply.ok) { setErrors(reply.errors ?? {}); setError(reply.error || 'No se pudo enviar tu consulta. Intenta nuevamente.'); return; }
      setSent(true);
    } catch { setError('No pudimos conectar. Tus datos siguen aquí; intenta nuevamente.'); }
    finally { setBusy(false); }
  }
  const inputError = (key: string) => ({ 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `jms-help-${key}-error` : undefined });
  return <div ref={dock} className="jms-help">
    <button ref={trigger} className="jms-help-trigger" type="button" aria-label="¿Necesitas ayuda?" aria-expanded={open} aria-controls="jms-help-panel" onClick={() => setOpen(current => !current)}><span aria-hidden="true">?</span></button>
    <span className="jms-help-tip" aria-hidden="true">¿Necesitas ayuda?</span>
    <section ref={panel} id="jms-help-panel" className="jms-help-panel" role="dialog" aria-modal="false" aria-labelledby="jms-help-title" hidden={!open}>
      <div className="jms-help-heading"><h2 id="jms-help-title">¿Necesitas ayuda?</h2><button type="button" className="jms-help-close" aria-label="Cerrar ayuda" onClick={close}>×</button></div>
      {sent ? <div className="jms-help-success" role="status"><span aria-hidden="true">✓</span><h3 ref={result} tabIndex={-1}>¡Consulta recibida!</h3><p>El colegio se pondrá en contacto contigo.</p><button type="button" onClick={close}>Entendido</button></div> : <>
        <p className="jms-help-description">Déjanos tus datos y tu duda.<br />El colegio te contactará para ayudarte.</p>
        <form ref={form} noValidate onSubmit={submit}>
          <fieldset disabled={busy}>
            <label htmlFor="jms-help-name">Nombre completo</label><input ref={name} id="jms-help-name" name="name" type="text" autoComplete="name" maxLength={100} placeholder="Tu nombre y apellido" required {...inputError('name')} />
            {errors.name && <p className="jms-help-field-error" id="jms-help-name-error">{errors.name}</p>}
            <label htmlFor="jms-help-email">Correo electrónico</label><input id="jms-help-email" name="email" type="email" autoComplete="email" autoCapitalize="none" maxLength={150} placeholder="nombre@correo.cl" required {...inputError('email')} />
            {errors.email && <p className="jms-help-field-error" id="jms-help-email-error">{errors.email}</p>}
            <label htmlFor="jms-help-phone">Teléfono</label><input id="jms-help-phone" name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="+56 9 1234 5678" required {...inputError('phone')} />
            {errors.phone && <p className="jms-help-field-error" id="jms-help-phone-error">{errors.phone}</p>}
            <label htmlFor="jms-help-question">¿Cuál es tu duda?</label><textarea id="jms-help-question" name="question" maxLength={helpQuestionLimit} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Cuéntanos brevemente cómo podemos ayudarte…" required aria-invalid={!!errors.question} aria-describedby={`jms-help-count${errors.question ? ' jms-help-question-error' : ''}`} />
            <p id="jms-help-count" className="jms-help-count">{question.length} / {helpQuestionLimit} caracteres</p>
            {errors.question && <p className="jms-help-field-error" id="jms-help-question-error">{errors.question}</p>}
            <div className="jms-help-honeypot" aria-hidden="true"><label htmlFor="jms-help-website">Sitio web</label><input id="jms-help-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
            <p className="jms-help-note">Usaremos estos datos para responder tu consulta.</p>
            <button className="jms-help-send" type="submit">{busy ? 'Enviando…' : 'Solicitar contacto'}</button>
          </fieldset>
          {error && <p className="jms-help-field-error" role="alert">{error}</p>}
        </form>
      </>}
    </section>
  </div>;
}
