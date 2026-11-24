import test from 'node:test';
import assert from 'node:assert/strict';
import { capitalizeEnrollmentInput } from '../lib/matricula/capitalization';
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

test('primera letra mayúscula y resto minúsculas conservan tildes, ñ y el cursor', () => {
  const name = input('maría muñoz', { selectionStart: 5, selectionEnd: 5 });
  capitalizeEnrollmentInput(name);
  assert.equal(name.value, 'María muñoz');
  assert.equal(name.selectionStart, 5);
  const pasted = input('MARÍA JOSÉ MUÑOZ');
  capitalizeEnrollmentInput(pasted);
  assert.equal(pasted.value, 'María josé muñoz');
  const address = input('pasaje Ñuñoa 123, block b');
  capitalizeEnrollmentInput(address);
  assert.equal(address.value, 'Pasaje ñuñoa 123, block b');
  const expanded = input('straße', { selectionStart: 5, selectionEnd: 5 });
  capitalizeEnrollmentInput(expanded);
  assert.equal(expanded.value, 'Straße');
  assert.equal(expanded.selectionStart, 5);
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
  ]) { const before = field.value; capitalizeEnrollmentInput(field); assert.equal(field.value, before); }
  const composing = input('maría');
  capitalizeEnrollmentInput(composing, true); assert.equal(composing.value, 'maría');
  capitalizeEnrollmentInput(composing); assert.equal(composing.value, 'María');
});

test('el texto convertido se envía con la inicial mayúscula sin cambiar el correo ni las opciones', () => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fixture)) data.set(key, value);
  const name = input('maría josé'); capitalizeEnrollmentInput(name); data.set('nombres', name.value);
  const address = input('la concepción 6231'); capitalizeEnrollmentInput(address); data.set('direccion', address.value);
  const parsed = fromForm(data);
  parsed.vive0 = 'si';
  const result = validate(parsed);
  assert.deepEqual(result.errors, {});
  assert.equal(result.answers.nombres, 'María josé');
  assert.equal(result.answers.direccion, 'La concepción 6231');
  assert.equal(result.answers.apoderadoCorreoUsuario, fixture.apoderadoCorreoUsuario);
  assert.equal(result.answers.autorizacionImagenDecision, 'no');
});
