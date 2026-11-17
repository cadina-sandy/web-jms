export function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function csv(columns: readonly string[], rows: Record<string, unknown>[], labels: Record<string, string> = {}) {
  return '\uFEFF' + [columns.map(c => csvCell(labels[c] ?? c)).join(','), ...rows.map(row => columns.map(c => csvCell(row[c])).join(','))].join('\r\n');
}
