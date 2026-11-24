import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, timingSafeEqual } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

function access(env: Record<string, string>) {
  const source = readFileSync(new URL('../lib/matricula/access.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} as { authorizeStaff: (request: Request, permission?: 'admin' | 'view') => Response | null; staffRole: (request: Request) => string | null } };
  vm.runInNewContext(js, { module, exports: module.exports, process: { env }, Response, URL, require: (name: string) => name === 'node:crypto' ? { createHash, timingSafeEqual } : {} });
  return module.exports;
}
const request = (token: string, origin = 'https://colegio.invalid') => new Request('https://colegio.invalid/api/matriculas/', {
  headers: { authorization: `Bearer ${token}`, origin },
});

test('clave de lectura permite consultar y bloquea permisos administrativos', () => {
  const auth = access({ MATRICULA_EXPORT_TOKEN: 'admin-ficticio', MATRICULA_VIEW_TOKEN: 'lector-ficticio' });
  assert.equal(auth.staffRole(request('lector-ficticio')), 'viewer');
  assert.equal(auth.authorizeStaff(request('lector-ficticio'), 'view'), null);
  assert.equal(auth.authorizeStaff(request('lector-ficticio'))?.status, 403);
  assert.equal(auth.authorizeStaff(request('admin-ficticio')), null);
  assert.equal(auth.authorizeStaff(request('admin-ficticio'), 'view'), null);
  assert.equal(auth.authorizeStaff(request('incorrecta'), 'view')?.status, 401);
  assert.equal(auth.authorizeStaff(request(''), 'view')?.status, 401);
  assert.equal(auth.authorizeStaff(request('lector-ficticio', 'https://otro.invalid'), 'view')?.status, 403);
});

test('configuración incompleta o coincidente nunca eleva la clave de lectura', () => {
  const auth = access({ MATRICULA_VIEW_TOKEN: 'lector-ficticio' });
  assert.equal(auth.authorizeStaff(request('lector-ficticio'), 'view'), null);
  assert.equal(auth.authorizeStaff(request('lector-ficticio'))?.status, 403);
  assert.equal(access({}).authorizeStaff(request(''), 'view')?.status, 503);
  const collision = access({ MATRICULA_VIEW_TOKEN: 'misma-clave', MATRICULA_EXPORT_TOKEN: 'misma-clave' });
  assert.equal(collision.authorizeStaff(request('misma-clave'))?.status, 403);
});
