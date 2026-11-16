import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, fromForm } from '../lib/matricula/validation';
import { csv } from '../lib/matricula/csv';
import { fields } from '../lib/matricula/fields';
export const fixture = {
  fechaMatricula: '2026-11-16', curso: '1°A', nombres: 'PRUEBA FICTICIA', apellidoPaterno: 'NO REAL', fechaNacimiento: '2020-05-01', genero: 'prefiero-no-responder', tipoIdentificacion: 'ipe', ipe: '999999999', ipeDigito: '0', nacionalidad: 'Chile', direccion: 'DIRECCIÓN FICTICIA 123', comuna: 'Macul', numeroPersonasHogar: '2', apoderadoNombres: 'APODERADO FICTICIO', apoderadoApellidos: 'NO REAL', apoderadoTipoIdentificacion: 'ipa', apoderadoIpa: '999999998', apoderadoIpaDigito: '0', apoderadoNacionalidad: 'Chile', apoderadoParentesco: 'Tutor', apoderadoCelular: '900000000', apoderadoCorreoUsuario: 'prueba', apoderadoCorreoDominio: 'otra', apoderadoCorreoDominioOtro: 'example.invalid', emergenciaContacto: 'apoderado', emergenciaCelular: '900000000', saludTipoPrevision: 'fonasa', saludTieneDiagnostico: 'no', saludConsultorio: 'santa-julia', saludImpedimentoEducacionFisica: 'no', estudianteNuevo: 'no', cursoRepetido: 'no', funcionarioMatricula: 'otro', funcionarioMatriculaOtro: 'PRUEBA AUTOMATIZADA',
};
test('ficha ficticia permite correo estudiante vacío y otro dominio apoderado', () => assert.deepEqual(validate(fixture).errors, {}));
test('obligatorios y detalles condicionales se validan en servidor', () => {
  const { errors } = validate({ ...fixture, nombres: '', saludTieneDiagnostico: 'si', apoderadoCorreoDominioOtro: '' });
  assert.ok(errors.nombres); assert.ok(errors.saludDetalleDiagnostico); assert.ok(errors.apoderadoCorreoDominioOtro);
});
test('correo estudiante parcial o inválido se rechaza', () => {
  assert.ok(validate({...fixture, correoUsuario: 'hola'}).errors.correoDominio);
  assert.ok(validate({...fixture, correoUsuario: 'hola', correoDominio: 'otra', correoDominioOtro: '@mal'}).errors.correoDominioOtro);
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
