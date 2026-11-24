import test from 'node:test';
import assert from 'node:assert/strict';
import { uppercaseEnrollmentInput } from '../lib/matricula/uppercase';
import { fromForm, validate } from '../lib/matricula/validation';
import { fixture } from './fixture';

function input(value: string, options: Partial<HTMLInputElement> = {}) {
  return {
    tagName: 'INPUT', type: 'text', value, disabled: false, readOnly: false,
    selectionStart: value.length, selectionEnd: value.length, selectionDirection: 'none',
    hasAttribute: () => false,
    setSelectionRange(start: number, end: number) { this.selectionStart = start; this.selectionEnd = end; },
    ...options,
  } as HTMLInputElement;
}

test('mayúsculas reales al escribir o pegar conservan tildes, ñ y el cursor', () => {
  const name = input('maría muñoz', { selectionStart: 5, selectionEnd: 5 });
  uppercaseEnrollmentInput(name);
  assert.equal(name.value, 'MARÍA MUÑOZ');
  assert.equal(name.selectionStart, 5);
  const address = input('pasaje Ñuñoa 123, block b');
  uppercaseEnrollmentInput(address);
  assert.equal(address.value, 'PASAJE ÑUÑOA 123, BLOCK B');
  const expanded = input('straße', { selectionStart: 5, selectionEnd: 5 });
  uppercaseEnrollmentInput(expanded);
  assert.equal(expanded.value, 'STRASSE');
  assert.equal(expanded.selectionStart, 6);
});

test('correos, fechas, selecciones y composición en curso conservan su valor', () => {
  for (const field of [
    input('Usuario.Mixto', { hasAttribute: name => name === 'data-email-part' }),
    input('correo.Ejemplo.cl', { hasAttribute: name => name === 'data-email-part' }),
    input('2026-11-24', { type: 'date' }),
    input('si', { type: 'radio' }),
    input('oculto', { type: 'hidden' }),
    input('solo lectura', { readOnly: true }),
    input('apagado', { disabled: true }),
  ]) { const before = field.value; uppercaseEnrollmentInput(field); assert.equal(field.value, before); }
  const composing = input('maría');
  uppercaseEnrollmentInput(composing, true); assert.equal(composing.value, 'maría');
  uppercaseEnrollmentInput(composing); assert.equal(composing.value, 'MARÍA');
});

test('el texto convertido se envía y valida en mayúsculas sin cambiar el correo ni las opciones', () => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fixture)) data.set(key, value);
  const name = input('maría josé'); uppercaseEnrollmentInput(name); data.set('nombres', name.value);
  const address = input('la concepción 6231'); uppercaseEnrollmentInput(address); data.set('direccion', address.value);
  const parsed = fromForm(data);
  parsed.vive0 = 'si';
  const result = validate(parsed);
  assert.deepEqual(result.errors, {});
  assert.equal(result.answers.nombres, 'MARÍA JOSÉ');
  assert.equal(result.answers.direccion, 'LA CONCEPCIÓN 6231');
  assert.equal(result.answers.apoderadoCorreoUsuario, fixture.apoderadoCorreoUsuario);
  assert.equal(result.answers.autorizacionImagenDecision, 'no');
});
