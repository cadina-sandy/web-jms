import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { fixture } from '../tests/fixture';

// Explicit opt-in: writes exactly one fictitious enrollment and keeps its receipt.
if (process.env.MATRICULA_SMOKE !== '1') throw new Error('Se requiere MATRICULA_SMOKE=1');
const base = process.env.MATRICULA_TEST_URL;
const token = process.env.MATRICULA_EXPORT_TOKEN;
assert.ok(base && token, 'Configura MATRICULA_TEST_URL y MATRICULA_EXPORT_TOKEN');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ ignoreHTTPSErrors: process.env.MATRICULA_TEST_IGNORE_HTTPS_ERRORS === '1', viewport: {width: 1280, height: 900} });
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(process.env.MATRICULA_TEST_SHARE_URL || base);
  await page.goto(new URL('/reserva-matricula/', base).href);
  await page.getByRole('button', {name: 'Aquí', exact: true}).click();
  await page.getByRole('button', {name: 'Guardar Matrícula', exact: true}).click();
  await page.waitForSelector('[aria-invalid="true"]');
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('name')), 'curso');
  console.log('Validación junto al campo y foco: OK');
  for (const [name, value] of Object.entries(fixture)) {
    const controls = page.locator(`[name="${name}"]`);
    const first = controls.first();
    if (await first.getAttribute('type') === 'radio') await page.locator(`[name="${name}"][value="${value}"]`).check();
    else if (await first.evaluate(node => node.tagName) === 'SELECT') await first.selectOption(value);
    else await first.fill(value);
  }
  const saved = page.waitForResponse(response => new URL(response.url()).pathname.replace(/\/$/, '') === '/api/matriculas' && response.status() !== 308 && response.status() !== 307 && response.request().method() === 'POST');
  await page.getByRole('button', {name: 'Guardar Matrícula', exact: true}).click();
  const response = await saved;
  assert.equal(response.status(), 201, await response.text());
  const {id} = await response.json();
  await page.getByRole('status').filter({hasText: 'Matrícula guardada.'}).waitFor();
  console.log('Guardar Matrícula → API → Neon → comprobante: OK', id);
  const payload = response.request().postDataJSON();
  const statuses = await page.evaluate(async ({payload, token}) => {
    const duplicate = await fetch('/api/matriculas/', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const unauthorized = await fetch('/api/matriculas/exportar/', {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer incorrecta'},body:JSON.stringify({columns:['id']})});
    const invalidColumns = await fetch('/api/matriculas/exportar/', {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({columns:['nombres; DROP TABLE matriculas_2027']})});
    const exported = await fetch('/api/matriculas/exportar/', {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({columns:['id','curso','nombres','apoderadoCorreoDominioOtro','correoUsuario']})});
    return {duplicate: duplicate.status, unauthorized: unauthorized.status, invalidColumns: invalidColumns.status, exported: exported.status, csv: await exported.text()};
  }, {payload, token});
  assert.equal(statuses.duplicate, 200); assert.equal(statuses.unauthorized, 401); assert.equal(statuses.invalidColumns, 400); assert.equal(statuses.exported, 200);
  assert.ok(statuses.csv.includes('"Comprobante","Curso 2027","Estudiante: nombres"'));
  const row = statuses.csv.split('\r\n').find(row => row.includes(id));
  assert.ok(row?.includes('"1°A","PRUEBA FICTICIA","example.invalid",""'));
  console.log('Lectura persistida, orden CSV, correo opcional, acceso denegado e idempotencia: OK');
  await page.goto(new URL('/personal/matriculas/', base).href);
  await page.getByLabel('Clave de exportación').fill(token);
  await page.getByRole('button', {name: 'Bajar Estudiante: nombres', exact: true}).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Descargar CSV', exact: true}).click();
  assert.equal((await download).suggestedFilename(), 'matriculas-2027.csv');
  assert.deepEqual(failures, []);
  console.log('Selector de columnas y descarga en navegador: OK');
} finally { await browser.close(); }
