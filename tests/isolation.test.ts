import {test} from 'node:test';
import assert from 'node:assert/strict';
import {databaseSchema, tableName} from '../lib/matricula/target';
test('producción, desarrollo y ramas Preview tienen destinos separados', () => {
  const production = databaseSchema({VERCEL_ENV:'production'});
  const preview = databaseSchema({VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'revision/matricula-2027-neon'});
  const other = databaseSchema({VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'otra'});
  assert.equal(production,'public'); assert.notEqual(preview,production); assert.notEqual(preview,other); assert.notEqual(databaseSchema({}),production);
  assert.match(preview,/^matricula_preview_[0-9a-f]{16}$/); assert.equal(tableName(production),'"public"."matriculas_2027"');
});
test('Preview sin rama o entorno desconocido falla de forma cerrada', () => {
  assert.throws(()=>databaseSchema({VERCEL_ENV:'preview'})); assert.throws(()=>databaseSchema({VERCEL_ENV:'invalid'}));
});
