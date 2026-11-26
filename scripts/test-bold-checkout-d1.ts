/** Actual checkout + SQL helpers against local Miniflare/workerd D1. No real bindings. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { webcrypto, createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { Miniflare } from 'miniflare';
import { parse } from 'yaml';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean);
const realContent = (path: string) => {
  const text = readFileSync(new URL(`../src/content/${path}.mdoc`, import.meta.url), 'utf8');
  const data = parse(text.split('---')[1]);
  if (data.event_start) data.event_start = new Date(data.event_start);
  return data;
};
const base = { title: 'Fixture', stock_max: 10, prices: [{ label: 'Adulto', amount: 50000 }] };

test('checkout regression: actual handler and atomic D1 SQL', async t => {
  const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("fixture")}}',
    compatibilityDate: '2026-06-15', d1Databases: ['DB'], host: '127.0.0.1' });
  try {
    const db = await mf.getD1Database('DB');
    await db.batch(schema.map(sql => db.prepare(sql)));
    let data: Record<string, any> = base;
    const env = { DB: db, BOLD_API_KEY: 'fixture-public', BOLD_SECRET_KEY: 'fixture-secret' };
    const cache = new Map<string, any>();
    function load(file: string): any {
      if (cache.has(file)) return cache.get(file);
      const exports = {};
      cache.set(file, exports);
      const output = ts.transpileModule(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      }).outputText;
      const imports = (id: string): any => {
        if (id === 'cloudflare:workers') return { env };
        if (id === 'astro:content') return { getEntry: async () => ({ data }) };
        if (id.startsWith('@/')) return load(id.slice(2) + '.ts');
        if (id.startsWith('node:')) return require(id);
        throw new Error(`Unexpected import: ${id}`);
      };
      runInNewContext(output, { exports, require: imports, Buffer, URL, Request, Response,
        crypto: webcrypto, console: { error() {} } });
      return exports;
    }
    const post = load('src/pages/api/checkout.ts').POST;
    const reset = async (next = base) => {
      await db.batch([db.prepare('DELETE FROM orders'), db.prepare('DELETE FROM inventory')]);
      data = next;
    };
    const send = async (tickets: unknown = [{ label: 'Adulto', quantity: 2 }], contentType = 'pasadia') => {
      const response: Response = await post({ request: new Request('https://fixture.invalid/api/checkout', {
        method: 'POST', body: JSON.stringify({ contentType, contentId: 'fixture', eventDate: '2027-01-10',
          tickets, customerData: { email: 'fixture@example.invalid', fullName: 'Fixture' } }),
      }) });
      return { status: response.status, payload: await response.json() as any };
    };
    const state = async () => ({
      orders: (await db.prepare('SELECT * FROM orders').all()).results,
      inventory: (await db.prepare('SELECT * FROM inventory').all()).results,
    });

    await t.test('real temazcal duplicate-label volume tier signs and stores 400000, not 460000', async () => {
      await reset(realContent('events/temazcal-abundancia-consciente'));
      const result = await send([{ label: 'General', quantity: 2, amount: 1 }], 'event');
      assert.equal(result.status, 200);
      assert.equal(result.payload.amount, 400000);
      assert.equal(result.payload.integritySignature, createHash('sha256').update(`${result.payload.orderId}400000COPfixture-secret`).digest('hex'));
      const snapshot = await state();
      assert.equal(snapshot.orders[0].amount, 400000);
      assert.deepEqual(JSON.parse(snapshot.orders[0].ticket_details as string), [{ label: 'General', quantity: 2, amount: 200000 }]);
      assert.equal(snapshot.inventory[0].stock_reserved, 2);
    });
    await t.test('real temazcal Pareja alias follows quantity and cannot buy one discounted ticket', async () => {
      for (const slug of ['temazcal-sanacion-cosmica', 'temazcal-nuevos-comienzos', 'temazcal-limpieza-emocional']) {
        await reset(realContent(`events/${slug}`));
        for (const [label, quantity, expected] of [['General', 2, 400000], ['Pareja', 1, 230000], ['Pareja', 2, 400000]] as const) {
          const result = await send([{ label, quantity, amount: 1 }], 'event');
          assert.equal(result.status, 200);
          assert.equal(result.payload.amount, expected, `${slug}: ${label} x ${quantity}`);
        }
      }
    });
    await t.test('splitting duplicated labels or aliases cannot alter volume pricing', async () => {
      await reset(realContent('events/temazcal-abundancia-consciente'));
      assert.equal((await send([{ label: 'General', quantity: 1 }, { label: 'General', quantity: 1 }], 'event')).payload.amount, 400000);
      await reset(realContent('events/temazcal-sanacion-cosmica'));
      assert.equal((await send([{ label: 'General', quantity: 1 }, { label: 'Pareja', quantity: 1 }], 'event')).payload.amount, 400000);
    });
    await t.test('all real pasadias retain their configured price and ignore client amount', async () => {
      for (const slug of ['basico', 'constelacional', 'detox', 'inbound', 'relax', 'viaje-del-alma']) {
        const fixture = realContent(`pasadias/pasadia-${slug}`);
        await reset(fixture);
        const result = await send([{ label: 'General', quantity: 2, amount: 1 }]);
        assert.equal(result.status, 200);
        assert.equal(result.payload.amount, fixture.prices[0].amount * 2);
      }
    });
    await t.test('real retiro independent Preventa, General, Pareja labels retain separate amounts', async () => {
      await reset(realContent('events/retiro-yoga-fin-de-semana'));
      const result = await send([{ label: 'Preventa', quantity: 1 }, { label: 'General', quantity: 1 }, { label: 'Pareja', quantity: 1 }], 'event');
      assert.equal(result.status, 200);
      assert.equal(result.payload.amount, 1230000);
    });
    await t.test('genuine Adulto/Niño categories keep their own quantity tiers', async () => {
      await reset({ ...base, prices: [{ label: 'Adulto', amount: 50000 }, { label: 'Niño', amount: 20000 }, { label: 'Adulto', amount: 40000, min_quantity: 2 }] } as any);
      assert.equal((await send([{ label: 'Adulto', quantity: 1 }, { label: 'Niño', quantity: 2 }])).payload.amount, 90000);
      assert.equal((await send([{ label: 'Adulto', quantity: 1 }, { label: 'Adulto', quantity: 1 }, { label: 'Niño', quantity: 1 }])).payload.amount, 100000);
    });
    await t.test('unmet standalone minimum fails before inventory and orders exist', async () => {
      await reset({ ...base, prices: [{ label: 'Adulto', amount: 40000, min_quantity: 2 }] } as any);
      assert.equal((await send([{ label: 'Adulto', quantity: 1 }])).status, 400);
      assert.deepEqual(await state(), { orders: [], inventory: [] });
    });
    await t.test('invalid ticket shapes and unsafe quantities cannot mutate D1', async () => {
      for (const tickets of [null, {}, 'Adulto', [null], [false], [{ label: 'Adulto', quantity: 1.5 }], [{ label: 'Adulto', quantity: 0 }], [{ label: 'Adulto', quantity: -1 }], [{ label: 'Adulto', quantity: Number.MAX_SAFE_INTEGER + 1 }], [{ label: 'Adulto', quantity: Number.MAX_SAFE_INTEGER }, { label: 'Adulto', quantity: 1 }]]) {
        await reset();
        assert.equal((await send(tickets)).status, 400, JSON.stringify(tickets));
        assert.deepEqual(await state(), { orders: [], inventory: [] });
      }
    });
    await t.test('undefined, fractional, nonpositive or unsafe prices and totals cannot mutate D1', async () => {
      for (const amount of [undefined, 0, -1, 1.5, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) {
        await reset({ ...base, prices: [{ label: 'Adulto', amount }] } as any);
        assert.equal((await send()).status, 400, String(amount));
        assert.deepEqual(await state(), { orders: [], inventory: [] });
      }
    });
    await t.test('failing order INSERT rolls back inventory initialization and reservation', async () => {
      await reset();
      await db.prepare("CREATE TRIGGER fixture_fail_order BEFORE INSERT ON orders BEGIN SELECT RAISE(ABORT, 'fixture insert failure'); END").run();
      try {
        assert.equal((await send()).status, 500);
        assert.deepEqual(await state(), { orders: [], inventory: [] });
      } finally { await db.prepare('DROP TRIGGER fixture_fail_order').run(); }
    });
    await t.test('failing order INSERT rolls back reservation on existing inventory', async () => {
      await reset();
      await db.prepare("INSERT INTO inventory(content_type,content_id,event_date,stock_max,stock_reserved) VALUES ('pasadia','fixture','2027-01-10',10,3)").run();
      await db.prepare("CREATE TRIGGER fixture_fail_order BEFORE INSERT ON orders BEGIN SELECT RAISE(ABORT, 'fixture insert failure'); END").run();
      try {
        assert.equal((await send()).status, 500);
        const snapshot = await state();
        assert.equal(snapshot.orders.length, 0);
        assert.equal(snapshot.inventory[0].stock_reserved, 3);
      } finally { await db.prepare('DROP TRIGGER fixture_fail_order').run(); }
    });
    await t.test('duplicate order reference constraint rolls back the second reservation', async () => {
      await reset();
      const first = await send();
      assert.equal(first.status, 200);
      await assert.rejects(() => load('src/lib/db-d1.ts').createOrderAndReserve(db, {
        orderId: first.payload.orderId, contentType: 'pasadia', contentId: 'fixture', eventDate: '2027-01-10',
        stockMax: 10, quantity: 2, amount: 100000, customerEmail: 'fixture@example.invalid',
        customerName: 'Fixture', ticketDetails: '[]',
      }));
      const snapshot = await state();
      assert.equal(snapshot.orders.length, 1);
      assert.equal(snapshot.inventory[0].stock_reserved, 2);
    });
    await t.test('failing inventory UPDATE rolls back initialization without an order', async () => {
      await reset();
      await db.prepare("CREATE TRIGGER fixture_fail_reservation BEFORE UPDATE ON inventory BEGIN SELECT RAISE(ABORT, 'fixture reserve failure'); END").run();
      try {
        assert.equal((await send()).status, 500);
        assert.deepEqual(await state(), { orders: [], inventory: [] });
      } finally { await db.prepare('DROP TRIGGER fixture_fail_reservation').run(); }
    });
    await t.test('insufficient initial stock creates neither inventory nor orphan orders', async () => {
      await reset({ ...base, stock_max: 1 });
      const result = await send();
      assert.equal(result.status, 409);
      assert.equal(result.payload.available, 1);
      assert.deepEqual(await state(), { orders: [], inventory: [] });
    });
    await t.test('insufficient existing stock leaves reservation unchanged and no new order', async () => {
      await reset({ ...base, stock_max: 3 });
      assert.equal((await send()).status, 200);
      const result = await send();
      assert.equal(result.status, 409);
      assert.equal(result.payload.available, 1);
      const snapshot = await state();
      assert.equal(snapshot.orders.length, 1);
      assert.equal(snapshot.inventory[0].stock_reserved, 2);
    });
    await t.test('concurrent checkouts never oversell and every reserved unit belongs to an order', async () => {
      await reset({ ...base, stock_max: 5 });
      const results = await Promise.all(Array.from({ length: 8 }, () => send()));
      assert.equal(results.filter(r => r.status === 200).length, 2);
      assert.equal(results.filter(r => r.status === 409).length, 6);
      const snapshot = await state();
      assert.equal(snapshot.orders.length, 2);
      assert.equal(snapshot.inventory[0].stock_reserved, 4);
      assert.equal(snapshot.orders.reduce((sum, order) => sum + Number(order.quantity), 0), snapshot.inventory[0].stock_reserved);
    });
  } finally { await mf.dispose(); }
});
