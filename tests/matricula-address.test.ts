import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAddressFound } from '../lib/matricula/address';

const result = {
  country_code: 'cl', street: 'Avenida Macul', housenumber: '3240',
  city: 'Santiago', municipality: 'Macul', result_type: 'building',
  rank: { match_type: 'full_match', confidence_building_level: 1 },
};

test('solo consulta calle, número y comuna, y reconoce una coincidencia completa', async t => {
  const request = t.mock.method(globalThis, 'fetch', async (url: string) => {
    const query = new URL(url).searchParams;
    assert.deepEqual(Object.fromEntries(query), {
      street: 'Av. Macul', housenumber: '3240', city: 'Macul',
      filter: 'countrycode:cl', format: 'json', limit: '5', apiKey: 'test',
    });
    return Response.json({ results: [result] });
  });
  assert.equal(await isAddressFound('Av. Macul N° 3240', 'Macul', 'test'), true);
  assert.equal(await isAddressFound('Av. Macul s/n', 'Macul', 'test'), false);
  assert.equal(request.mock.callCount(), 1);
});

test('coincidencias parciales, comuna o número distinto y fallas quedan pendientes', async t => {
  const request = t.mock.method(globalThis, 'fetch', async () => Response.json({
    results: [
      { ...result, rank: { ...result.rank, match_type: 'match_by_street' } },
      { ...result, result_type: 'street' },
      { ...result, rank: { ...result.rank, confidence_building_level: 0.6 } },
      { ...result, housenumber: '3250' },
      { ...result, municipality: 'Peñalolén' },
    ],
  }));
  assert.equal(await isAddressFound('Av. Macul 3240', 'Macul', 'test'), false);
  request.mock.mockImplementation(async () => new Response(null, { status: 429 }));
  assert.equal(await isAddressFound('Av. Macul 3240', 'Macul', 'test'), false);
  request.mock.mockImplementation(async () => { throw new Error('timeout'); });
  assert.equal(await isAddressFound('Av. Macul 3240', 'Macul', 'test'), false);
});
