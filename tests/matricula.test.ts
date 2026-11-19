import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, fromForm } from '../lib/matricula/validation';
import { csv } from '../lib/matricula/csv';
import { fields } from '../lib/matricula/fields';
import { fixture } from './fixture';
test('ficha ficticia permite correo estudiante vacío y otro dominio apoderado', () => assert.deepEqual(validate(fixture).errors, {}));
test('obligatorios y detalles condicionales se validan en servidor', () => {
  const { errors } = validate({ ...fixture, nombres: '', saludTieneDiagnostico: 'si', apoderadoCorreoDominioOtro: '' });
  assert.ok(errors.nombres); assert.ok(errors.saludDetalleDiagnostico); assert.ok(errors.apoderadoCorreoDominioOtro);
});
test('correo estudiante parcial o inválido se rechaza', () => {
  assert.ok(validate({...fixture, correoUsuario: 'hola'}).errors.correoDominio);
  assert.ok(validate({...fixture, correoUsuario: 'hola', correoDominio: 'otra', correoDominioOtro: '@mal'}).errors.correoDominioOtro);
});
test('la arroba se señala en el campo exacto de cada correo', () => {
  const { errors } = validate({
    ...fixture,
    correoUsuario: 'estudiante@gmail.com', correoDominio: 'gmail.com',
    apoderadoCorreoUsuario: 'apoderado@', apoderadoCorreoDominioOtro: '@ejemplo.cl',
  });
  assert.match(errors.correoUsuario, /anterior al @/);
  assert.match(errors.apoderadoCorreoUsuario, /anterior al @/);
  assert.match(errors.apoderadoCorreoDominioOtro, /sin @/);
  assert.equal(errors.correoDominio, undefined);
});
test('cada checkbox y cada dato de retiro se conserva separado', () => {
  const form = new FormData(); form.append('conQuienVive', 'Solo madre'); form.append('conQuienVive', 'Otro');
  form.set('personasAutorizadas[1][nombre]', 'Retiro ficticio'); form.set('apoderadoSuplenteRutNumero', '123');
  const answers = fromForm(form);
  assert.equal(answers.vive0, 'si'); assert.equal(answers.vive1, 'no'); assert.equal(answers.vive6, 'si');
  assert.equal(answers.retiro2Nombre, 'Retiro ficticio'); assert.equal(answers.apoderadoSuplenteRutNumero, '123');
  assert.equal(new Set(fields).size, fields.length);
});
test('CSV mantiene orden y neutraliza fórmulas y comillas', () => {
  assert.equal(csv(['curso','nombres'], [{nombres:'=SUM(1)',curso:'A,"B"'}]), '\uFEFF"curso","nombres"\r\n"A,""B""","\'=SUM(1)"');
});
test('fechas imposibles y teléfonos incompletos se rechazan', () => {
  const {errors} = validate({...fixture, fechaNacimiento: '2020-02-31', apoderadoCelular:'12'});
  assert.ok(errors.fechaNacimiento); assert.ok(errors.apoderadoCelular);
});

test('todos los campos base requieren respuesta, sin forzar consentimiento de imagen', () => {
  const result = validate({...fixture, apellidoMaterno:'', apoderadoFechaNacimiento:'', programaApoyoFamiliar:'', autorizacionImagenDecision:'no', autorizacionImagenFirma:''});
  assert.ok(result.errors.apellidoMaterno); assert.ok(result.errors.apoderadoFechaNacimiento); assert.ok(result.errors.programaApoyoFamiliar);
  assert.ok(result.errors.autorizacionImagenFirma);
});
test('suplente IPA se valida y sus datos de retiro se resuelven en servidor', () => {
  const {answers, errors} = validate(fixture);
  assert.deepEqual(errors, {});
  assert.equal(answers.retiro1Nombre, fixture.apoderadoSuplenteNombreCompleto);
  assert.equal(answers.retiro1TipoIdentificacion, 'ipa');
  assert.equal(answers.retiro1Ipa, fixture.apoderadoSuplenteIpa);
  assert.ok(validate({...fixture, apoderadoSuplenteIpa:''}).errors.apoderadoSuplenteIpa);
});
test('sin suplente exige selección de retiro válida, no detalles ocultos', () => {
  const result = validate({...fixture, apoderadoSuplenteAplica:'no-aplica', retiro1Origen:'apoderado'});
  assert.deepEqual(result.errors, {}); assert.equal(result.answers.apoderadoSuplenteIpa, '');
  assert.ok(validate({...fixture, apoderadoSuplenteAplica:'no-aplica'}).errors.retiro1Origen);
});

test('pueblo originario exige una respuesta explícita y conserva Sí o No', () => {
  const form = new FormData();
  assert.equal(fromForm(form).pertenecePuebloOriginario, '');
  for (const answer of ['si', 'no']) {
    form.set('pertenecePuebloOriginario', answer);
    assert.equal(fromForm(form).pertenecePuebloOriginario, answer);
    assert.equal(validate({ ...fixture, pertenecePuebloOriginario: answer }).errors.pertenecePuebloOriginario, undefined);
  }
  for (const answer of ['', 'otro']) {
    assert.ok(validate({ ...fixture, pertenecePuebloOriginario: answer }).errors.pertenecePuebloOriginario);
  }
});

test('rechazo de imagen conserva declaración, firma y fecha y valida el suplente', () => {
  const declaration = {
    ...fixture, autorizacionImagenDecision: 'no',
    autorizacionImagenApoderado: 'apoderado', autorizacionImagenFirma: 'Apoderado de prueba',
    autorizacionImagenFecha: '18/11/2026',
  };
  const { answers, errors } = validate(declaration);
  assert.deepEqual(errors, {});
  assert.equal(answers.autorizacionImagenDecision, 'no');
  assert.equal(answers.autorizacionImagenFirma, declaration.autorizacionImagenFirma);
  assert.equal(answers.autorizacionImagenFecha, declaration.autorizacionImagenFecha);
  assert.ok(validate({ ...declaration, apoderadoSuplenteAplica: 'no-aplica', autorizacionImagenApoderado: 'apoderado-suplente' }).errors.autorizacionImagenApoderado);
});
