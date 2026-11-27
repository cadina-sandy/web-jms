import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
test('historial, edición y papelera en PostgreSQL aislado: permisos, fechas inmutables, conflicto, auditoría y rollback', () => {
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('./helpers/audit-postgres.cjs', import.meta.url))], { encoding: 'utf8', timeout: 60000 });
  assert.match(output, /PASS PostgreSQL/);
});
