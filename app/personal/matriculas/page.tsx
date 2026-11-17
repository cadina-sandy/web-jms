'use client';

import { useState, type FormEvent } from 'react';
import { enrollmentCourses } from '@/lib/matricula/fields';

export default function ExportMatriculas() {
  const [course, setCourse] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/matriculas/exportar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course: course || null }),
      });
      if (!response.ok) {
        setMessage((await response.json() as { error: string }).error);
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'matriculas-2027.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToken('');
      setMessage('CSV descargado.');
    } catch {
      setMessage('No se pudo descargar. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell" style={{ paddingBlock: '3rem' }}>
      <h1>Exportar matrícula 2027</h1>
      <p>Solo personal autorizado.</p>
      <form onSubmit={download}>
        <p>
          <label>
            Clave de exportación{' '}
            <input type="password" autoComplete="off" required value={token} onChange={event => setToken(event.target.value)} />
          </label>
        </p>
        <p>
          <label>
            Curso a exportar{' '}
            <select value={course} onChange={event => setCourse(event.target.value)}>
              <option value="">Todos los cursos</option>
              {enrollmentCourses.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </p>
        <p>Campos del CSV{' · '}<strong>Todos los campos con datos</strong></p>
        <button type="submit" disabled={!token || busy}>{busy ? 'Exportando…' : 'Descargar CSV'}</button>
        <p role="status">{message}</p>
      </form>
    </main>
  );
}
