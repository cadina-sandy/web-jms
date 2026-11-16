'use client';
import { useState } from 'react';
import { labels } from '@/lib/matricula/labels';
import { fields } from '@/lib/matricula/fields';

const available = ['id', 'created_at', ...fields];
export default function ExportMatriculas() {
  const [selected, setSelected] = useState<string[]>(['nombres', 'apellidoPaterno', 'apellidoMaterno', 'curso']);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  function move(index: number, direction: number) {
    setSelected(current => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }
  async function download() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/matriculas/exportar/', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ columns: selected }) });
      if (!response.ok) { setMessage((await response.json() as { error: string }).error); return; }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = 'matriculas-2027.csv'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToken(''); setMessage('CSV descargado.');
    } catch { setMessage('No se pudo descargar. Intenta nuevamente.'); }
    finally { setBusy(false); }
  }
  return <main className="shell" style={{ paddingBlock: '3rem' }}>
    <h1>Exportar matrícula 2027</h1>
    <p>Solo personal autorizado. Solicita la clave de exportación a administración.</p>
    <label>Clave de exportación <input type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} /></label>
    <h2>Columnas y orden del CSV</h2>
    <p>Las columnas se exportan en el orden de esta lista. Puedes elegir los datos del estudiante, apoderado y personas autorizadas para retiro.</p>
    <ol>{selected.map((field, i) => <li key={field} style={{ marginBlock: '.5rem' }}>
      {labels[field]}{' '}
      <button type="button" disabled={i === 0} aria-label={`Subir ${labels[field]}`} onClick={() => move(i, -1)}>↑</button>{' '}
      <button type="button" disabled={i === selected.length - 1} aria-label={`Bajar ${labels[field]}`} onClick={() => move(i, 1)}>↓</button>{' '}
      <button type="button" onClick={() => setSelected(selected.filter(c => c !== field))}>Quitar {labels[field]}</button>
    </li>)}</ol>
    <label>Agregar columna <select value="" onChange={e => setSelected([...selected, e.target.value])}>
      <option value="" disabled>Selecciona un campo</option>
      {available.filter(c => !selected.includes(c)).map(c => <option key={c} value={c}>{labels[c]}</option>)}
    </select></label>{' '}
    <button type="button" disabled={!selected.length || !token || busy} onClick={download}>{busy ? 'Exportando…' : 'Descargar CSV'}</button>
    <p role="status">{message}</p>
  </main>;
}
