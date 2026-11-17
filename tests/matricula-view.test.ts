import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enrollmentDate, enrollmentName, enrollmentSections } from '../lib/matricula/view';

test('vista de ficha mantiene grupos y combina correo, convivencia y fecha', () => {
  const record = {
    id: 'ficha-ficticia',
    nombres: 'PRUEBA FICTICIA',
    apellidoPaterno: 'JMS',
    apellidoMaterno: 'No aplica',
    fechaNacimiento: '2020-05-01',
    apoderadoNombres: 'Apoderado ficticio',
    apoderadoCorreoUsuario: 'prueba',
    apoderadoCorreoDominio: 'otra',
    apoderadoCorreoDominioOtro: 'example.invalid',
    vive0: 'si',
    vive1: 'no',
    vive4: 'si',
    pertenecePuebloOriginario: 'no',
    autorizacionImagenDecision: 'no',
  };

  assert.equal(enrollmentName(record), 'PRUEBA FICTICIA JMS');
  assert.equal(enrollmentDate('2026-11-16'), '16/11/2026');
  const sections = enrollmentSections(record);
  assert.deepEqual(sections.map(section => section.title), ['Datos del estudiante', 'Apoderado principal', 'Autorización de uso de imagen']);
  const values = Object.fromEntries(sections.flatMap(section => section.entries.map(entry => [entry.label, entry.value])));
  assert.equal(values['fecha de nacimiento'], '01/05/2020');
  assert.equal(values.Correo, 'prueba@example.invalid');
  assert.equal(values['Vive con'], 'Solo madre, Abuela/o');
  assert.equal(values['Pertenece a pueblo originario'], 'No');
});

test('vista de ficha conserva los textos ingresados y deja fuera campos vacíos', () => {
  const [section] = enrollmentSections({ id: 'ficha-ficticia', direccion: '__proto__', comuna: '  ' });
  assert.deepEqual(section.entries, [{ key: 'direccion', label: 'dirección', value: '__proto__' }]);
});
