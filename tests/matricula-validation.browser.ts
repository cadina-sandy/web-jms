import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { fixture } from './fixture';

// Browser regression: aborts API calls and never writes an enrollment.
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
try {
  const page = await browser.newPage();
  let submissions = 0;
  await page.route('**/api/matriculas/', async route => { submissions++; await route.abort(); });
  await page.goto(new URL('/reserva-matricula/', process.env.MATRICULA_TEST_URL || 'http://localhost:3002').href);
  await page.getByRole('button', {name:'Aquí', exact:true}).click();
  await page.locator('.student-household summary').click();
  await page.locator('[name="conQuienVive"][value="Solo madre"]').check();
  for (const [name,value] of Object.entries(fixture)) {
    if (name === 'nombres' || name.startsWith('vive') || name === 'retiroCantidad') continue;
    const field = page.locator(`[name="${name}"]`).first();
    if (await field.getAttribute('type') === 'radio') await page.locator(`[name="${name}"][value="${value}"]`).check();
    else if (await field.evaluate(node=>node.tagName) === 'SELECT') await field.selectOption(value);
    else await field.fill(value);
  }
  assert.equal(await page.locator('[aria-invalid="true"]').count(), 0);
  await page.getByRole('button', {name:'Guardar Matrícula', exact:true}).click();
  await page.locator('[name="nombres"][aria-invalid="true"]').waitFor();
  assert.equal(await page.locator('[aria-invalid="true"]').count(), 1);
  await page.locator('[name="nombres"]').fill(fixture.nombres);
  await page.locator('[aria-invalid="true"]').waitFor({state:'detached'});
  assert.equal(await page.locator('[data-field-error]').count(), 0);
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('name')), 'nombres');

  await page.locator('[name="nombres"]').fill('');
  await page.locator('[name="apellidoPaterno"]').fill('');
  await page.getByRole('button', {name:'Guardar Matrícula', exact:true}).click();
  await page.locator('[name="apellidoPaterno"][aria-invalid="true"]').waitFor();
  assert.equal(await page.locator('[aria-invalid="true"]').count(), 2);
  await page.locator('[name="nombres"]').fill(fixture.nombres);
  await page.locator('[name="nombres"][aria-invalid="true"]').waitFor({state:'detached'});
  assert.equal(await page.locator('[aria-invalid="true"]').count(), 1);
  assert.equal(await page.locator('[aria-invalid="true"]').getAttribute('name'), 'apellidoPaterno');
  await page.locator('[name="apellidoPaterno"]').fill(fixture.apellidoPaterno);
  await page.locator('[aria-invalid="true"]').waitFor({state:'detached'});

  await page.locator('[name="apoderadoCelular"]').fill('12');
  await page.getByRole('button', {name:'Guardar Matrícula', exact:true}).click();
  await page.locator('[name="apoderadoCelular"][aria-invalid="true"]').waitFor();
  await page.locator('[name="apoderadoCelular"]').fill('123');
  assert.equal(await page.locator('[name="apoderadoCelular"]').getAttribute('aria-invalid'), 'true');
  await page.locator('[name="apoderadoCelular"]').fill('900000000');
  await page.locator('[aria-invalid="true"]').waitFor({state:'detached'});
  assert.equal(await page.locator('[data-field-error]').count(), 0);

  const nationalitySelects = page.getByRole('combobox', {name: 'Nacionalidad', exact: true});
  for (const select of await nationalitySelects.all()) await select.selectOption('otra');
  const form = page.locator('.reservation-form form');
  const save = page.getByRole('button', {name: 'Guardar Matrícula', exact: true});
  await save.click();
  for (const [name, value] of [['nacionalidad', 'Canadá'], ['apoderadoNacionalidad', 'Italia']]) {
    const input = page.locator(`input[name="${name}"]`);
    assert.equal(await input.getAttribute('aria-invalid'), 'true');
    await input.fill(value);
    assert.equal(await form.evaluate((node, field) => new FormData(node as HTMLFormElement).get(field), name), value);
  }
  await page.locator('[aria-invalid="true"]').waitFor({state:'detached'});
  await page.locator('[name="correoDominio"]').selectOption('otra');
  for (const name of ['correoUsuario', 'apoderadoCorreoUsuario', 'correoDominioOtro', 'apoderadoCorreoDominioOtro']) {
    const input = page.locator(`input[name="${name}"]`);
    await input.fill('prueba@ejemplo.cl');
    await page.locator(`input[name="${name}"][aria-invalid="true"]`).waitFor();
    await input.fill(name.endsWith('Otro') ? 'ejemplo.cl' : 'prueba');
    await page.locator(`input[name="${name}"][aria-invalid="true"]`).waitFor({state:'detached'});
  }
  assert.equal(submissions, 0);
  console.log('Solo campos inválidos en rojo; corrección individual inmediata, sin perder foco ni ocultar errores pendientes: OK');
} finally { await browser.close(); }
