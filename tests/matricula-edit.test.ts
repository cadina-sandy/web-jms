import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnrollmentEdit, completeEmail, emailEdit } from '../lib/matricula/edit';
import { fixture } from './fixture';

test('targeted correction preserves registration date, legacy course and all unrelated data',()=>{
  const original={...fixture,apoderadoCorreoDominioOtro:'live.con.ar'};
  const result=prepareEnrollmentEdit(original,{apoderadoCorreoDominioOtro:'live.com.ar'});
  assert.deepEqual(result.errors,{});
  assert.deepEqual(result.changes,[{field:'apoderadoCorreoDominioOtro',before:'live.con.ar',after:'live.com.ar'}]);
  assert.equal(result.values.fechaMatricula,undefined);assert.equal(result.values.curso,undefined);
});
test('metadata, derived status and original responsible cannot be directly edited',()=>{
  for(const field of ['id','numero_ficha','created_at','fechaMatricula','matriculaRol','funcionarioMatricula','comprobacionDireccion']) {
    assert.ok(prepareEnrollmentEdit(fixture,{[field]:'cambio'}).errors[field]);
  }
});
test('email editing keeps the complete address together and validates both parts',()=>{
  assert.equal(completeEmail({...fixture,...emailEdit('prueba@live.com.ar',true)},true),'prueba@live.com.ar');
  assert.deepEqual(prepareEnrollmentEdit(fixture,emailEdit('correo@sin-dominio',true)).errors.apoderadoCorreoDominioOtro,'Escribe un dominio válido (por ejemplo, ejemplo.cl).');
});
test('dependent pickup data follows guardian corrections and address loses stale verification',()=>{
  const original={...fixture,retiro1Origen:'apoderado',retiro1Nombre:'APODERADO FICTICIO NO REAL',comprobacionDireccion:'Dirección encontrada'};
  const result=prepareEnrollmentEdit(original,{apoderadoNombres:'Nombre corregido'});
  assert.deepEqual(result.errors,{});assert.equal(result.values.retiro1Nombre,'Nombre corregido NO REAL');
  const address=prepareEnrollmentEdit(original,{direccion:'Otra calle 123'});
  assert.equal(address.values.comprobacionDireccion,'');
  assert.ok(!('fechaMatricula' in address.values));
});
test('partial editing accepts historic incompleteness but rejects new errors and invalid options',()=>{
  const old={nombres:'Registro anterior'};
  assert.deepEqual(prepareEnrollmentEdit(old,{apoderadoCorreoUsuario:'correo',apoderadoCorreoDominio:'otra',apoderadoCorreoDominioOtro:'example.invalid'}).errors,{});
  assert.ok(prepareEnrollmentEdit(fixture,{nombres:''}).errors.nombres);
  assert.ok(prepareEnrollmentEdit(fixture,{genero:'valor inventado'}).errors.genero);
  assert.ok(prepareEnrollmentEdit(fixture,{apoderadoSuplenteAplica:'no-aplica'}).errors.retiro1Origen);
});
