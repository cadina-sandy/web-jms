import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { validateHelpRequest, helpMailText } from '../lib/matricula/help';
const inquiry = { name: 'Persona ficticia', email: 'persona@example.invalid', phone: '+56 9 0000 0000', question: '¿Qué documentos debo llevar?', website: '' };
function load(path: string, dependencies: Record<string, unknown> = {}, env: Record<string, string> = {}) {
  const module = { exports: {} as any };
  const js = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, process: { env }, console: { error: () => {} }, Request, Response, URL, Date, Map, require: (name: string) => dependencies[name] ?? {} });
  return module.exports;
}

test('consulta valida contacto y límite, conserva tildes y rechaza inyección en correo', () => {
  assert.deepEqual(validateHelpRequest(inquiry).errors, {});
  for (const [key, value] of [['email', 'persona@example.invalid\r\nBcc: otro@example.invalid'], ['name', 'nombre\nBcc: otro'], ['phone', 'abc'], ['question', 'x'.repeat(281)], ['name', []]]) {
    assert.ok(Object.keys(validateHelpRequest({ ...inquiry, [key as string]: value }).errors).length);
  }
  assert.deepEqual(validateHelpRequest({ ...inquiry, question: 'x'.repeat(280) }).errors, {});
  assert.match(helpMailText(inquiry), /Teléfono: \+56 9 0000 0000/);
  assert.match(helpMailText(inquiry), /¿Qué documentos debo llevar\?/);
});

test('endpoint bloquea otros orígenes, automatizaciones y exceso sin enviar mensajes', async () => {
  let deliveries = 0;
  const route = load('../app/api/matriculas/ayuda/route.ts', { 'node:crypto': { createHash }, '@/lib/matricula/help': { validateHelpRequest }, '@/lib/matricula/help-mail': { sendHelpRequest: async () => { deliveries++; return true; } } }).POST;
  const request = (body: unknown, origin = 'https://colegio.invalid', type = 'application/json') => new Request('https://colegio.invalid/api/matriculas/ayuda/', { method: 'POST', headers: { origin, 'content-type': type, 'x-forwarded-for': '192.0.2.2' }, body: JSON.stringify(body) });
  assert.equal((await route(request(inquiry, 'https://otro.invalid'))).status, 403);
  assert.equal((await route(request(inquiry, undefined, 'text/plain'))).status, 415);
  assert.equal((await route(request({ ...inquiry, question: 'x'.repeat(281) }))).status, 422);
  assert.equal((await route(request({ ...inquiry, website: 'bot.example' }))).status, 200);
  assert.equal(deliveries, 0);
  for (let i = 0; i < 3; i++) assert.equal((await route(request(inquiry))).status, 200);
  assert.equal((await route(request(inquiry))).status, 429);
  assert.equal(deliveries, 3);
});

test('fallo de correo no confirma una consulta como recibida', async () => {
  const route = load('../app/api/matriculas/ayuda/route.ts', { 'node:crypto': { createHash }, '@/lib/matricula/help': { validateHelpRequest }, '@/lib/matricula/help-mail': { sendHelpRequest: async () => false } }).POST;
  const response = await route(new Request('https://colegio.invalid/api/', { method: 'POST', headers: { origin: 'https://colegio.invalid', 'content-type': 'application/json' }, body: JSON.stringify(inquiry) }));
  assert.equal(response.status, 503); assert.ok(!(await response.json()).ok);
});

test('correo tiene destinatario fijo y respuesta al consultante, y Preview no envía', async () => {
  let delivered: any;
  const nodemailer = { createTransport: () => ({ sendMail: async (mail: unknown) => { delivered = mail; return { accepted: ['matriculas.jms@gmail.com'] }; }, close() {} }) };
  const dependencies = { 'server-only': {}, nodemailer, './help': { helpMailText } };
  const preview = load('../lib/matricula/help-mail.ts', dependencies, { VERCEL_ENV: 'preview', MATRICULA_GMAIL_APP_PASSWORD: 'ficticia' });
  assert.equal(await preview.sendHelpRequest(inquiry), false); assert.equal(delivered, undefined);
  const production = load('../lib/matricula/help-mail.ts', dependencies, { VERCEL_ENV: 'production', MATRICULA_GMAIL_APP_PASSWORD: 'ficticia' });
  assert.equal(await production.sendHelpRequest(inquiry), true);
  const mail = delivered as any;
  assert.equal(mail.to.address, 'matriculas.jms@gmail.com');
  assert.equal(mail.from.address, 'matriculas.jms@gmail.com');
  assert.equal(mail.replyTo.address, inquiry.email);
  assert.ok(!mail.html);
});
