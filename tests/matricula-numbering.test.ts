import test from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { enrollmentNumberingSql } from '../lib/matricula/numbering';
import { enrollmentNumber } from '../lib/matricula/view';

test('números por antigüedad, estables tras migrar de nuevo, y sin reutilización al vaciar fichas', async () => {
  const pg = new PGlite();
  const target = 'prueba_numeracion';
  const table = '"prueba_numeracion"."matriculas_2027"';
  const ids = ['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
  const migrate = () => pg.transaction(async tx => { for (const statement of enrollmentNumberingSql(target)) await tx.query(statement); });
  try {
    await pg.exec(`CREATE SCHEMA ${target}; CREATE TABLE ${table} (id uuid PRIMARY KEY,created_at timestamptz NOT NULL DEFAULT now());`);
    await pg.query(`INSERT INTO ${table} (id,created_at) VALUES ($1,'2026-01-03'),($2,'2026-01-01'),($3,'2026-01-02')`, ids);
    await migrate();
    const first = (await pg.query<{ id: string; numero_ficha: string | number }>(`SELECT id,numero_ficha FROM ${table} ORDER BY numero_ficha`)).rows;
    assert.deepEqual(first.map(row => row.id), [ids[1],ids[2],ids[0]]);
    assert.deepEqual(first.map(enrollmentNumber), ['1','2','3']);
    await migrate();
    assert.deepEqual((await pg.query(`SELECT id,numero_ficha FROM ${table} ORDER BY numero_ficha`)).rows, first);
    await pg.query(`DELETE FROM ${table}`); // Only this ephemeral test database is affected.
    await migrate();
    const result = await pg.query<{ numero_ficha: string | number }>(`INSERT INTO ${table} (id) VALUES ($1) RETURNING numero_ficha`, [ids[0]]);
    assert.equal(enrollmentNumber(result.rows[0]), '4');
    await assert.rejects(pg.query(`INSERT INTO ${table} (id,numero_ficha) VALUES ($1,4)`, [ids[1]]));
  } finally { await pg.close(); }
});
