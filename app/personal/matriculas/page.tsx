'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { enrollmentCourses } from '@/lib/matricula/fields';
import { enrollmentDate, enrollmentName, enrollmentSections, pageSize, type EnrollmentRecord, type EnrollmentSummary } from '@/lib/matricula/view';

export default function ExportMatriculas() {
  const [course, setCourse] = useState('');
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<'list' | 'record' | 'csv' | 'delete' | null>(null);
  const [listing, setListing] = useState<{ records: EnrollmentSummary[]; hasMore: boolean; offset: number } | null>(null);
  const [record, setRecord] = useState<EnrollmentRecord | null>(null);
  const recordHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    recordHeading.current?.focus();
  }, [record]);

  function clearResults() {
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
    clearResults();
    try {
      const response = await request('consultar', { course: course || null, search, offset });
      const result = await response.json() as { records: EnrollmentSummary[]; hasMore: boolean };
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
    if (busy || !token || !listing) return;
    const name = enrollmentName(row);
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la ficha de ${name}, curso ${row.curso}?\n\nComprobante: ${row.id}\n\nDejará de aparecer en las fichas y en el CSV. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    setBusy('delete');
    setMessage('');
    try {
      await request('eliminar', { id: row.id });
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

  async function download() {
    if (busy || !token) return;
    setBusy('csv');
    setMessage('');
    try {
      const response = await request('exportar', { course: course || null });
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'matriculas-2027.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToken('');
      clearResults();
      setMessage('CSV descargado.');
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
      <h1>Exportar matrícula 2027</h1>
      <p className="enrollment-admin-intro">Consulta las fichas guardadas o descarga el CSV del curso seleccionado. Solo personal autorizado.</p>
      <form className="enrollment-admin-controls" onSubmit={searchForEnrollment}>
        <div className="enrollment-admin-filters">
          <label>
            Clave de exportación
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
          <button type="button" disabled={!token || !!busy} onClick={download}>{busy === 'csv' ? 'Exportando…' : 'Descargar CSV'}</button>
          {token && <button type="button" disabled={!!busy} onClick={() => { setToken(''); setSearch(''); clearResults(); }}>Cerrar consulta</button>}
        </div>
        <p className="enrollment-admin-csv-note">Campos del CSV{' · '}<strong>Todos los campos con datos</strong></p>
        {message && <p role="status">{message}</p>}
      </form>

      {listing && !record && (
        <section className="enrollment-admin-results" aria-labelledby="saved-enrollments-title">
          <h2 id="saved-enrollments-title">Fichas guardadas</h2>
          {listing.records.length ? (
            <ul className="enrollment-admin-list">
              {listing.records.map(row => (
                <li key={row.id}>
                  <div><strong>{enrollmentName(row)}</strong><span>{row.curso}{row.fechaMatricula && ` · ${enrollmentDate(row.fechaMatricula)}`}</span></div>
                  <div className="enrollment-row-actions">
                    <button type="button" disabled={!!busy} aria-label={`Ver ficha de ${enrollmentName(row)}`} onClick={() => loadRecord(row.id)}>Ver ficha</button>
                    <button className="enrollment-delete" type="button" disabled={!!busy}
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

      {record && (
        <article className="enrollment-record" aria-labelledby="enrollment-record-title">
          <header className="enrollment-record-heading">
            <div>
              <h2 id="enrollment-record-title" ref={recordHeading} tabIndex={-1}>{enrollmentName(record)}</h2>
              <dl className="enrollment-record-meta">
                <div><dt>Fecha de matrícula</dt><dd>{enrollmentDate(record.fechaMatricula ?? '')}</dd></div>
                <div><dt>Curso 2027</dt><dd>{record.curso}</dd></div>
                <div><dt>Comprobante</dt><dd>{record.id}</dd></div>
              </dl>
            </div>
            <button type="button" onClick={() => setRecord(null)}>Volver al listado</button>
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
      )}
    </main>
  );
}
