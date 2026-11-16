import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { fixture } from './fixture';

// UI-only success/failure responses: never writes to Neon.
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
try {
  const page = await browser.newPage();
  const ids: string[] = [];
  await page.route('**/api/matriculas/', async route => {
    const { id } = route.request().postDataJSON(); ids.push(id);
    await route.fulfill({status: ids.length === 1 ? 503 : 201, contentType:'application/json', body:JSON.stringify(ids.length === 1 ? {error:'No se pudo guardar. Intenta nuevamente.'} : {id,created:true})});
  });
  async function fill() {
    await page.locator('.student-household summary').click();
    await page.locator('[name="conQuienVive"][value="Solo madre"]').check();
    for (const [name,value] of Object.entries(fixture)) {
      if (name.startsWith('vive') || name === 'retiroCantidad') continue;
      const field = page.locator(`[name="${name}"]`).first();
      if (await field.getAttribute('type') === 'radio') await page.locator(`[name="${name}"][value="${value}"]`).check();
      else if (await field.evaluate(node => node.tagName) === 'SELECT') await field.selectOption(value);
      else await field.fill(value);
    }
  }
  await page.goto(new URL('/reserva-matricula/',process.env.MATRICULA_TEST_URL || 'http://localhost:3003').href);
  await page.getByRole('button',{name:'Aquí',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Hacer Nueva Matrícula',exact:true}).count(),0);
  await fill();
  await page.getByRole('button',{name:'Agregar otra persona'}).click();
  await page.locator('[name="retiro2Origen"]').selectOption('apoderado');
  await page.getByRole('button',{name:'Guardar Matrícula',exact:true}).click();
  await page.getByRole('status').filter({hasText:'No se pudo guardar.'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Hacer Nueva Matrícula',exact:true}).count(),0);
  assert.equal(await page.locator('[name="nombres"]').inputValue(),fixture.nombres);
  await page.getByRole('button',{name:'Guardar Matrícula',exact:true}).click();
  await page.getByRole('button',{name:'Hacer Nueva Matrícula',exact:true}).waitFor();
  assert.equal(ids[0],ids[1], 'El reintento conserva el mismo comprobante');
  assert.ok(await page.locator('[name="nombres"]').isDisabled());
  await page.getByRole('button',{name:'Hacer Nueva Matrícula',exact:true}).click();
  await page.getByRole('button',{name:'Guardar Matrícula',exact:true}).waitFor();
  assert.equal(await page.locator('[name="nombres"]').inputValue(),'');
  assert.equal(await page.locator('[name="apoderadoNombres"]').inputValue(),'');
  assert.equal(await page.locator('[name="curso"]').inputValue(),'');
  assert.equal(await page.locator('[name="matriculaRol"]').inputValue(),'');
  assert.equal(await page.locator('[name="retiroCantidad"]').inputValue(),'1');
  assert.equal(await page.locator('[name="retiro2Origen"]').count(),0);
  assert.equal(await page.locator('[name="apoderadoCorreoDominioOtro"]').count(),0);
  assert.equal(await page.locator('input:checked').count(),0);
  assert.equal(await page.locator('[aria-invalid="true"], [data-field-error]').count(),0);
  assert.equal(await page.getByRole('status').textContent(),'');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'titulo-formulario');
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  assert.equal(await page.locator('[name="fechaMatricula"]').inputValue(),today);
  assert.ok(await page.getByRole('button',{name:'Guardar Matrícula',exact:true}).isEnabled());
  await fill();
  await page.getByRole('button',{name:'Guardar Matrícula',exact:true}).click();
  await page.getByRole('button',{name:'Hacer Nueva Matrícula',exact:true}).waitFor();
  assert.notEqual(ids[2],ids[1], 'La segunda matrícula tiene un comprobante nuevo');
  console.log('Botón solo tras éxito, ficha nueva limpia y abierta, fecha actual, foco al título y comprobante distinto: OK');
} finally { await browser.close(); }
