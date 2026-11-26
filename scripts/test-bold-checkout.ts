/** Exercise the actual checkout handler without network, customer data or real D1. */
import assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/pages/api/checkout.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const boldExports: Record<string, unknown> = {};
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/bold.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: boldExports, require: () => crypto, Buffer, Response });
async function checkout(overrides: Record<string, unknown> = {}) {
  const bindings: Record<string, unknown> = { BOLD_API_KEY: 'fixture-public', BOLD_SECRET_KEY: 'fixture-secret', ...overrides };
  const writes: unknown[][] = [];
  let reservations = 0;
  const db = { prepare: () => ({ bind: (...values: unknown[]) => ({ run: async () => { writes.push(values); return { meta: { changes: 1 } }; } }) }) };
  const exports: Record<string, any> = {};
  const dependencies: Record<string, unknown> = {
    'cloudflare:workers': { env: bindings },
    '@/src/lib/bold': boldExports,
    'node:crypto': crypto,
    'astro:content': { getEntry: async () => ({ data: { title: 'Fixture visit', stock_max: 10, prices: [{ label: 'Adulto', amount: 50000 }] } }) },
    '@/src/lib/d1': { getDB: () => db },
    '@/src/lib/db-d1': { createOrderAndReserve: async (_db: unknown, order: Record<string, unknown>) => {
      reservations++; writes.push(Object.values(order)); return { success: true };
    } },
  };
  runInNewContext(compiled, { exports, require: (name: string) => {
    assert.ok(name in dependencies, `Unexpected import ${name}`); return dependencies[name];
  }, Request, Response, URL, crypto: crypto.webcrypto, console: { error() {} } });
  const request = new Request('https://varsana-co.iaforchange.workers.dev/api/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      contentType: 'pasadia', contentId: 'a-very-long-content-slug-that-must-not-appear-in-bold-reference-because-of-the-sixty-character-limit',
      eventDate: '2027-01-10', tickets: [{ label: 'Adulto', quantity: 2 }],
      customerData: { email: 'fixture@example.invalid', fullName: 'Fixture' },
    }),
  });
  const response: Response = await exports.POST({ request });
  return { response, payload: await response.json() as Record<string, any>, writes, reservations };
}

test('missing public or secret key fails before reserving inventory or creating orders', async () => {
  for (const overrides of [{ BOLD_API_KEY: undefined }, { BOLD_SECRET_KEY: undefined }, { BOLD_SECRET_KEY: '' }, { BOLD_SECRET_KEY: '   ' }]) {
    const result = await checkout(overrides);
    assert.equal(result.response.status, 503);
    assert.equal(result.reservations, 0);
    assert.equal(result.writes.length, 0);
  }
});

test('invalid payment environment is rejected before stock mutation', async () => {
  for (const mode of ['staging', '', null, true, 0]) {
    const result = await checkout({ BOLD_ENVIRONMENT: mode });
    assert.equal(result.response.status, 503);
    assert.equal(result.reservations, 0);
  }
});

test('checkout signs real server total with an opaque reference within Bold limit', async () => {
  const result = await checkout();
  assert.equal(result.response.status, 200);
  assert.equal(result.payload.amount, 100000);
  assert.match(result.payload.orderId, /^pasadia-[0-9a-f-]{36}$/);
  assert.ok(result.payload.orderId.length <= 60);
  assert.equal(result.payload.integritySignature, crypto.createHash('sha256').update(`${result.payload.orderId}100000COPfixture-secret`).digest('hex'));
  assert.equal(result.payload.apiKey, 'fixture-public');
  assert.ok(!JSON.stringify(result.payload).includes('fixture-secret'));
  assert.equal(result.reservations, 1);
  assert.equal(result.writes.length, 1);
});

test('obsolete site binding cannot redirect customers to the old site', async () => {
  const result = await checkout({ PUBLIC_SITE_URL: 'https://obsolete.example.invalid' });
  assert.equal(result.payload.redirectionUrl, 'https://varsana-co.iaforchange.workers.dev/pago/exito');
});

test('test checkout still requires the test secret for integrity hash', async () => {
  const result = await checkout({ BOLD_ENVIRONMENT: 'test', BOLD_SECRET_KEY: undefined });
  assert.equal(result.response.status, 503);
  assert.equal(result.reservations, 0);
  const valid = await checkout({ BOLD_ENVIRONMENT: 'test' });
  assert.equal(valid.response.status, 200);
});
