import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
test('historial y papelera sobre PostgreSQL aislado: permisos, migración, rollback y confirmación', () => {
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('./helpers/audit-postgres.cjs', import.meta.url))], { encoding: 'utf8', timeout: 60000 });
  assert.match(output, /PASS PostgreSQL/);
});
