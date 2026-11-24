import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enrollmentCourses, enrollmentLevel, enrollmentCourseVariants } from '../lib/matricula/fields';
import { validate } from '../lib/matricula/validation';
import { fixture } from './fixture';

test('niveles sin letra y compatibilidad de matrículas previas', () => {
  assert.deepEqual(enrollmentCourses, ['Pre-kínder', 'Kínder', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°']);
  for (let grade = 1; grade <= 8; grade++) {
    const level = `${grade}°`;
    for (const value of [level, `${level}A`, `${level}B`, `${grade}º`]) {
      assert.equal(enrollmentLevel(value), level);
      assert.ok(enrollmentCourseVariants(level).includes(value));
      const result = validate({ ...fixture, curso: value });
      assert.equal(result.errors.curso, undefined);
      assert.equal(result.answers.curso, level);
    }
  }
  assert.deepEqual(enrollmentCourseVariants('Pre-kínder'), ['Pre-kínder']);
  assert.deepEqual(enrollmentCourseVariants('9°'), []);
  assert.ok(validate({ ...fixture, curso: '9°' }).errors.curso);
});
