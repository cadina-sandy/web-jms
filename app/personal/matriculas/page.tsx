'use client';

import { useEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { enrollmentCourses } from '@/lib/matricula/fields';
import { enrollmentDate, enrollmentName, enrollmentSections, pageSize, type EnrollmentRecord, type EnrollmentSummary } from '@/lib/matricula/view';

export default function ExportMatriculas() {
  const [course, setCourse] = useState('');
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'list' | 'record' | 'csv' | 'delete' | 'select' | 'print' | 'word' | null>(null);
  const [listing, setListing] = useState<{ records: EnrollmentSummary[]; hasMore: boolean; offset: number } | null>(null);
  const [record, setRecord] = useState<EnrollmentRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [printRecords, setPrintRecords] = useState<EnrollmentRecord[]>([]);
  const [role, setRole] = useState<'admin' | 'viewer' | null>(null);
  const canManage = role === 'admin';
  const recordHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    recordHeading.current?.focus();
  }, [record]);

  useEffect(() => {
    if (!printRecords.length) return;
    const finish = () => {
      setPrintRecords([]);
      setBusy(null);
    };
    window.addEventListener('afterprint', finish, { once: true });
    const frame = window.requestAnimationFrame(() => {
      try { window.print(); } catch {
        finish();
        setMessage('No se pudo abrir la impresión. Intenta nuevamente.');
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', finish);
    };
  }, [printRecords]);

  function clearResults(resetSelection = true) {
    if (resetSelection) {
      setRole(null);
      setSelectedIds([]);
      setAllMatchingSelected(false);
      setPrintRecords([]);
    }
    setListing(null);
    setRecord(null);
    setMessage('');
  }

  async function request(action: 'consultar' | 'exportar' | 'eliminar', body: object) {
    const response = await fetch(`/api/matriculas/${action}/`, {
      method: action === 'eliminar' ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) clearResults();
      const result = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(result?.error || 'No se pudo completar la solicitud.');
    }
    return response;
  }

  async function loadList(offset = 0) {
    if (busy || !token) return;
    setBusy('list');
    clearResults(false);
    try {
      const response = await request('consultar', { course: course || null, search, offset });
      const result = await response.json() as { records: EnrollmentSummary[]; hasMore: boolean };
      setRole(response.headers.get('X-Matricula-Role') === 'admin' ? 'admin' : 'viewer');
      setListing({ ...result, offset });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron consultar las fichas.');
    } finally {
      setBusy(null);
    }
  }

  async function loadRecord(id: string) {
    if (busy || !token) return;
    setBusy('record');
    setMessage('');
    try {
      const response = await request('consultar', { id });
      const result = await response.json() as { record: EnrollmentRecord };
      setRecord(result.record);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo consultar la ficha.');
    } finally {
      setBusy(null);
    }
  }

  async function deleteRecord(row: EnrollmentSummary) {
    if (!canManage || busy || !token || !listing) return;
    const name = enrollmentName(row);
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la ficha de ${name}, curso ${row.curso}?\n\nComprobante: ${row.id}\n\nDejará de aparecer en las fichas y en el CSV. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    setBusy('delete');
    setMessage('');
    try {
      await request('eliminar', { id: row.id });
      setSelectedIds(current => current.filter(id => id !== row.id));
      setAllMatchingSelected(false);
      // Update immediately even if refreshing the current page fails.
      setListing(current => current ? { ...current, records: current.records.filter(item => item.id !== row.id) } : null);
      setRecord(null);
      setMessage(`Ficha de ${name} eliminada.`);
      const offset = listing.records.length === 1 && listing.offset > 0 ? listing.offset - pageSize : listing.offset;
      try {
        const response = await request('consultar', { course: course || null, search, offset });
        const result = await response.json() as { records: EnrollmentSummary[]; hasMore: boolean };
        setListing({ ...result, offset });
      } catch {
        setMessage(`Ficha de ${name} eliminada. Pulsa «Ver fichas» para actualizar el listado.`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar la ficha. Intenta nuevamente.');
    } finally {
      setBusy(null);
    }
  }

  async function selectAll(checked: boolean) {
    if (!canManage || busy || !token) return;
    if (!checked) {
      setSelectedIds([]);
      setAllMatchingSelected(false);
      return;
    }
    setBusy('select');
    setMessage('');
    try {
      const ids = new Set<string>();
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const response = await request('consultar', { course: course || null, search, offset });
        const result = await response.json() as { records: EnrollmentSummary[]; hasMore: boolean };
        result.records.forEach(row => ids.add(row.id));
        hasMore = result.hasMore;
        offset += pageSize;
      }
      setSelectedIds([...ids]);
      setAllMatchingSelected(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron seleccionar las fichas.');
    } finally {
      setBusy(null);
    }
  }

  function selectRecord(id: string, checked: boolean) {
    if (!canManage || busy) return;
    setSelectedIds(current => checked ? [...current, id] : current.filter(value => value !== id));
    setAllMatchingSelected(false);
  }

  async function printSelected() {
    if (!canManage || busy || !token || !selectedIds.length) return;
    setBusy('print');
    setMessage('Preparando fichas para imprimir…');
    try {
      const records: EnrollmentRecord[] = [];
      for (let offset = 0; offset < selectedIds.length; offset += pageSize) {
        const response = await request('consultar', { ids: selectedIds.slice(offset, offset + pageSize) });
        const result = await response.json() as { records: EnrollmentRecord[] };
        records.push(...result.records);
      }
      setPrintRecords(records);
      setMessage('');
    } catch (error) {
      setPrintRecords([]);
      setBusy(null);
      setMessage(error instanceof Error ? error.message : 'No se pudieron preparar las fichas.');
    }
  }

  async function download(format: 'csv' | 'docx') {
    if (!canManage || busy || !token || !selectedIds.length) return;
    setBusy(format === 'docx' ? 'word' : 'csv');
    setMessage('');
    try {
      const response = await request('exportar', { ids: selectedIds, course: course || null, format });
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? `matriculas-2027.${format}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(format === 'docx' ? 'Archivo Word descargado.' : 'CSV descargado.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo descargar. Intenta nuevamente.');
    } finally {
      setBusy(null);
    }
  }

  function searchForEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadList();
  }

  return (
    <main className="shell enrollment-admin">
      <h1>Fichas de matrícula 2027</h1>
      <p className="enrollment-admin-intro">Consulta las fichas guardadas y selecciona las que quieras imprimir o descargar. Solo personal autorizado.</p>
      <form className="enrollment-admin-controls" onSubmit={searchForEnrollment}>
        <div className="enrollment-admin-filters">
          <label>
            Clave de acceso
            <input type="password" autoComplete="off" required disabled={!!busy} value={token} onChange={event => { setToken(event.target.value); clearResults(); }} />
          </label>
          <label>
            Curso
            <select value={course} disabled={!!busy} onChange={event => { setCourse(event.target.value); clearResults(); }}>
              <option value="">Todos los cursos</option>
              {enrollmentCourses.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Buscar estudiante en las fichas
            <input type="search" placeholder="Nombre o apellido" maxLength={100} disabled={!!busy} value={search} onChange={event => { setSearch(event.target.value); clearResults(); }} />
          </label>
        </div>
        <div className="enrollment-admin-actions">
          <button className="enrollment-admin-primary" type="submit" disabled={!token || !!busy}>{busy === 'list' ? 'Buscando…' : 'Ver fichas'}</button>
          {token && <button type="button" disabled={!!busy} onClick={() => { setToken(''); setSearch(''); clearResults(); }}>Cerrar consulta</button>}
        </div>
        {message && <p role="status">{message}</p>}
      </form>

      {role === 'viewer' && <p role="status">Acceso de solo lectura. Puedes buscar y ver fichas; la selección, impresión, descarga y eliminación están desactivadas.</p>}

      {listing && !record && (
        <section className="enrollment-admin-results" aria-labelledby="saved-enrollments-title">
          <h2 id="saved-enrollments-title">Fichas guardadas</h2>
          {listing.records.length > 0 && (
            <div className="enrollment-selection">
              <label>
                <input type="checkbox" checked={allMatchingSelected} disabled={!canManage || !!busy}
                  onChange={event => { void selectAll(event.target.checked); }} />
                Seleccionar todos
              </label>
              <span>{selectedIds.length} {selectedIds.length === 1 ? 'ficha seleccionada' : 'fichas seleccionadas'}</span>
              <button type="button" disabled={!canManage || !selectedIds.length || !!busy} onClick={printSelected}>
                {busy === 'print' ? 'Preparando impresión…' : 'Imprimir seleccionadas'}
              </button>
              <button type="button" disabled={!canManage || !selectedIds.length || !!busy} onClick={() => download('csv')}>
                {busy === 'csv' ? 'Exportando…' : 'Descargar CSV'}
              </button>
              <button type="button" disabled={!canManage || !selectedIds.length || !!busy} onClick={() => download('docx')}>
                {busy === 'word' ? 'Preparando Word…' : 'Descargar editable formato ficha'}
              </button>
              <small>Las tres acciones usan las fichas marcadas. «Seleccionar todos» incluye todas las páginas de esta búsqueda.</small>
              <small>CSV con todos los campos con datos. El editable se descarga en Word (.docx), con formato de ficha.</small>
            </div>
          )}
          {listing.records.length ? (
            <ul className="enrollment-admin-list">
              {listing.records.map(row => (
                <li key={row.id}>
                  <label className="enrollment-select-record">
                    <input type="checkbox" checked={selectedIds.includes(row.id)} disabled={!canManage || !!busy}
                      aria-label={`Seleccionar ficha de ${enrollmentName(row)}`}
                      onChange={event => selectRecord(row.id, event.target.checked)} />
                    <span><strong>{enrollmentName(row)}</strong><span>{row.curso}{row.fechaMatricula && ` · ${enrollmentDate(row.fechaMatricula)}`}</span></span>
                  </label>
                  <div className="enrollment-row-actions">
                    <button type="button" disabled={!!busy} aria-label={`Ver ficha de ${enrollmentName(row)}`} onClick={() => loadRecord(row.id)}>Ver ficha</button>
                    <button className="enrollment-delete" type="button" disabled={!canManage || !!busy}
                      aria-label={`Eliminar ficha de ${enrollmentName(row)}`} title="Eliminar ficha"
                      onClick={() => deleteRecord(row)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p role="status">No hay fichas para esta búsqueda.</p>}
          {(listing.offset > 0 || listing.hasMore) && (
            <div className="enrollment-admin-actions">
              <button type="button" disabled={listing.offset === 0 || !!busy} onClick={() => loadList(listing.offset - pageSize)}>Anterior</button>
              <button type="button" disabled={!listing.hasMore || !!busy} onClick={() => loadList(listing.offset + pageSize)}>Siguiente</button>
            </div>
          )}
        </section>
      )}

      {record && <EnrollmentDetails record={record} headingRef={recordHeading} onBack={() => setRecord(null)} />}
      <section className="enrollment-print" aria-label="Fichas para imprimir">
        {printRecords.map(item => <EnrollmentDetails key={item.id} record={item} />)}
      </section>
    </main>
  );
}

function EnrollmentDetails({ record, headingRef, onBack }: { record: EnrollmentRecord; headingRef?: Ref<HTMLHeadingElement>; onBack?: () => void }) {
  return (
        <article className="enrollment-record" aria-labelledby={`enrollment-record-${record.id}`}>
          <header className="enrollment-record-heading">
            <div>
              <h2 id={`enrollment-record-${record.id}`} ref={headingRef} tabIndex={-1}>Ficha de matrícula 2027</h2>
              <p className="enrollment-record-school">Escuela Julio Montt Salamanca</p>
              <p className="enrollment-record-student"><strong>Estudiante</strong> {enrollmentName(record)}</p>
              <dl className="enrollment-record-meta">
                <div><dt>Fecha de matrícula</dt><dd>{enrollmentDate(record.fechaMatricula ?? '')}</dd></div>
                <div><dt>Curso 2027</dt><dd>{record.curso}</dd></div>
                <div><dt>Comprobante</dt><dd>{record.id}</dd></div>
              </dl>
            </div>
            {onBack && <button type="button" onClick={onBack}>Volver al listado</button>}
          </header>
          {enrollmentSections(record).map(section => (
            <section key={section.title} className="enrollment-record-section">
              <h3>{section.title}</h3>
              <dl>
                {section.entries.map(({ key, label, value }) => <div key={key}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </section>
          ))}
        </article>
  );
}

