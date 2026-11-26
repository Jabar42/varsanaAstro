import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac, webcrypto } from 'node:crypto';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual transpiled route/helper source, replacing only platform,
// content, and delivery bindings. SQL runs against the real schema in SQLite.
const root = process.cwd();
const nativeRequire = createRequire(import.meta.url);
const pythonSQL = `
import json, sqlite3, sys
p=json.load(sys.stdin)
c=sqlite3.connect(p['path']); c.row_factory=sqlite3.Row
try:
 if 'schema' in p: c.executescript(p['schema'])
 out=[]
 for s in p.get('statements',[]):
  cur=c.execute(s['sql'],s.get('params',[]))
  rows=[dict(r) for r in cur.fetchall()] if cur.description else []
  out.append({'results':rows,'meta':{'changes':c.execute('SELECT changes()').fetchone()[0]},'success':True})
 c.commit(); print(json.dumps(out))
except Exception:
 c.rollback(); raise
finally: c.close()
`;
class LocalDB {
  path = join(mkdtempSync(join(tmpdir(), 'bold-db-')), 'db.sqlite');
  writes = 0;
  failBatch = false;
  constructor() { this.execute([], readFileSync(join(root, 'db/schema.sql'), 'utf8')); }
  execute(statements: {sql: string; params: unknown[]}[], schema?: string) {
    const p = spawnSync('/usr/bin/python3', ['-c', pythonSQL], {
      input: JSON.stringify({path: this.path, statements, schema}), encoding: 'utf8',
      env: {PATH: '/usr/bin:/bin', HOME: process.env.HOME!, TMPDIR: tmpdir()},
    });
    if (p.status !== 0) throw new Error(p.stderr);
    return JSON.parse(p.stdout);
  }
  prepare(sql: string) {
    const db = this;
    return new class Statement {
      params: unknown[] = [];
      sql = sql;
      bind(...params: unknown[]) { this.params = params; return this; }
      async first() { return db.execute([this])[0].results[0] ?? null; }
      async all() { return db.execute([this])[0]; }
      async run() { db.writes++; return db.execute([this])[0]; }
    }();
  }
  async batch(statements: {sql: string; params: unknown[]}[]) {
    this.writes += statements.length;
    if (this.failBatch) {
      // A real SQL failure in the second statement must roll back the first.
      return this.execute([statements[0], {sql: 'UPDATE missing_table SET value = 1', params: []}]);
    }
    return this.execute(statements);
  }
  seed(status = 'pending') {
    this.execute([
      {sql: `INSERT INTO inventory(content_type,content_id,event_date,stock_max,stock_reserved) VALUES ('event','retreat','2026-12-01',20,7)`, params: []},
      {sql: `INSERT INTO orders(bold_order_id,content_type,content_id,event_date,customer_email,customer_name,amount,currency,status,quantity,ticket_details) VALUES ('order-1','event','retreat','2026-12-01','dummy@example.invalid','Dummy',20000,'COP',?,2,'[]')`, params: [status]},
    ]);
  }
  state() {
    return this.execute([
      {sql: 'SELECT status, bold_tx_status FROM orders', params: []},
      {sql: 'SELECT stock_reserved FROM inventory', params: []},
    ]).map((r: any) => r.results);
  }
}
function harness(config: Record<string, unknown> = {}, status = 'pending') {
  const db = new LocalDB(); db.seed(status);
  const env = {DB: db, BOLD_SECRET_KEY: 'dummy-production-secret', ...config};
  const deliveries: string[] = [];
  const logs: string[] = [];
  let emailFails = false;
  const cache = new Map<string, any>();
  const load = (file: string): any => {
    file = resolve(file);
    if (cache.has(file)) return cache.get(file);
    const output = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText;
    const exports = {};
    cache.set(file, exports);
    const mockedRequire = (id: string): any => {
      if (id === 'cloudflare:workers') return {env};
      if (id === 'astro:content') return {getEntry: async () => ({data: {title: 'Retreat / Retiro'}})};
      if (id === '@/src/lib/email') return {sendOrderConfirmationEmail: async () => {
        deliveries.push('email'); if (emailFails) throw new Error('dummy failure');
      }};
      if (id === '@/src/lib/telegram') return {
        sendTelegramMessage: async (text: string) => { deliveries.push(text); },
        buildSaleMessage: () => 'sale', buildEmailErrorMessage: () => 'email-error',
      };
      if (id.startsWith('@/')) return load(join(root, id.slice(2)) + '.ts');
      if (id.startsWith('.')) return load(resolve(dirname(file), id) + (id.endsWith('.ts') ? '' : '.ts'));
      if (id.startsWith('node:')) return nativeRequire(id);
      throw new Error(`Unexpected import ${id}`);
    };
    vm.runInNewContext(`(function(require,module,exports){${output}\n})`, {
      Buffer, URL, Request, Response, Headers, TextEncoder, TextDecoder, crypto: webcrypto,
      console: Object.fromEntries(['log','warn','error'].map(k => [k, (...args: unknown[]) => logs.push(args.join(' '))])),
    }, {filename: file})(mockedRequire, {exports}, exports);
    return exports;
  };
  const webhook = load(join(root, 'src/pages/api/webhook/bold.ts')).POST;
  const verify = load(join(root, 'src/pages/api/verify-payment.ts')).POST;
  const orderStatus = load(join(root, 'src/pages/api/order-status.ts')).GET;
  const waits: Promise<unknown>[] = [];
  const context = (request: Request) => ({request, locals: {runtime: {ctx: {waitUntil(p: Promise<unknown>) { waits.push(p); }}}}});
  return {db, env, deliveries, logs, load,
    setEmailFailure() { emailFails = true; },
    async post(payload: unknown = event(), secret = 'dummy-production-secret', signature?: string) {
      const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const response = await webhook(context(new Request('https://dummy.invalid/api/webhook/bold', {
        method: 'POST', body: raw, headers: {'x-bold-signature': signature ?? sign(raw, secret)},
      })));
      await Promise.all(waits);
      return response as Response;
    },
    async verify(body: unknown) { return verify(context(new Request('https://dummy.invalid/api/verify-payment', {method: 'POST', body: JSON.stringify(body)}))) as Promise<Response>; },
    async status(id = 'order-1') { return orderStatus(context(new Request(`https://dummy.invalid/api/order-status?bold-order-id=${id}`))) as Promise<Response>; },
  };
}
function sign(raw: string, secret: string) { return createHmac('sha256', secret).update(Buffer.from(raw, 'utf8').toString('base64')).digest('hex'); }
async function json(response: Response): Promise<Record<string, unknown>> { return await response.json() as Record<string, unknown>; }
function event(type = 'SALE_APPROVED') { return {id: 'event-1', type, subject: 'payment-1', source: '/payments', spec_version: '1.0', time: 123, data: {payment_id: 'payment-1', metadata: {reference: 'order-1'}, amount: {total: 20000, currency: 'COP'}}}; }
function unchanged(h: ReturnType<typeof harness>, before: unknown) { assert.deepEqual(h.db.state(), before); assert.equal(h.db.writes, 0); assert.deepEqual(h.deliveries, []); }

for (const forged of ['approved', 'declined', 'failed', {malformed: true}]) {
  test(`verify-payment ignores forged redirect status ${JSON.stringify(forged)}`, async () => {
    const h = harness(); const before = h.db.state();
    const response = await h.verify({boldOrderId: 'order-1', boldTxStatus: forged});
    assert.equal(response.status, 200); assert.equal((await json(response)).status, 'pending');
    assert.equal(response.headers.get('cache-control'), 'no-store'); unchanged(h, before);
  });
}
test('verify-payment needs only order id, returns stored paid/failed/pending status', async () => {
  for (const status of ['paid','failed','pending']) {
    const h = harness({}, status); const before = h.db.state();
    const r = await h.verify({boldOrderId: 'order-1'});
    assert.equal(r.status, 200); assert.equal((await json(r)).status, status); unchanged(h, before);
  }
});
test('read endpoints validate input and never cache even errors/not_found', async () => {
  const h = harness();
  for (const body of [null, [], {}, {boldOrderId: 1}, {boldOrderId: ' '}]) {
    const r = await h.verify(body); assert.equal(r.status, 400); assert.equal(r.headers.get('cache-control'), 'no-store');
  }
  const missing = await h.verify({boldOrderId: 'missing'}); assert.equal(missing.status, 404); assert.equal(missing.headers.get('cache-control'), 'no-store');
  for (const id of ['order-1', 'missing', '']) {
    const r = await h.status(id); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await r.json(), {status: id === 'order-1' ? 'pending' : 'not_found'});
  }
  assert.equal(h.db.writes, 0);
});
test('valid production HMAC approves and sends existing sale/email once', async () => {
  const h = harness(); const r = await h.post();
  assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(h.db.state()[0][0].status, 'paid'); assert.deepEqual(h.deliveries, ['sale','email']);
});
for (const sig of ['', 'z'.repeat(64), '0'.repeat(64), 'abc', 'a'.repeat(66)]) {
  test(`rejects missing/malformed/incorrect production signature ${sig.slice(0, 8)}`, async () => {
    const h = harness(); const before = h.db.state(); const r = await h.post(event(), 'unused', sig);
    assert.equal(r.status, 401); unchanged(h, before);
    assert.ok(!h.logs.join(' ').includes('dummy-production-secret'));
    assert.ok(!h.logs.join(' ').includes('metadata'));
  });
}
test('valid uppercase hexadecimal HMAC is accepted', async () => {
  const h = harness(); const p = event();
  assert.equal((await h.post(p, '', sign(JSON.stringify(p), 'dummy-production-secret').toUpperCase())).status, 200);
});
for (const config of [{BOLD_SECRET_KEY: undefined}, {BOLD_SECRET_KEY: ''}, {BOLD_SECRET_KEY: '   '}, {ENVIRONMENT: 'staging', BOLD_SECRET_KEY: ''}, {BOLD_ENVIRONMENT: 'staging'}, {BOLD_ENVIRONMENT: ''}, {BOLD_ENVIRONMENT: 'TEST'}]) {
  test(`fail closed configuration ${JSON.stringify(config)}`, async () => {
    const h = harness(config); const before = h.db.state(); assert.equal((await h.post(event(), '')).status, 500); unchanged(h, before);
  });
}
test('explicit test mode uses empty HMAC key, not checkout secret', async () => {
  const h = harness({BOLD_ENVIRONMENT: 'test'});
  assert.equal((await h.post(event(), '')).status, 200);
  const reject = harness({BOLD_ENVIRONMENT: 'test'}); const before = reject.db.state();
  assert.equal((await reject.post()).status, 401); unchanged(reject, before);
});
test('explicit test HMAC also works without BOLD_SECRET_KEY', async () => {
  const h = harness({BOLD_ENVIRONMENT: 'test', BOLD_SECRET_KEY: undefined});
  assert.equal((await h.post(event(), '')).status, 200);
});
test('ENVIRONMENT staging alone cannot select empty-key HMAC', async () => {
  const h = harness({ENVIRONMENT: 'staging'}); const before = h.db.state();
  assert.equal((await h.post(event(), '')).status, 401); unchanged(h, before);
});
for (const field of ['amount', 'currency']) {
  for (const type of ['SALE_APPROVED', 'SALE_REJECTED']) {
    test(`${type} refuses ${field} mismatch without mutation/delivery`, async () => {
      const h = harness(); const before = h.db.state(); const p = event(type);
      if (field === 'amount') p.data.amount.total = 19999; else p.data.amount.currency = 'USD';
      assert.equal((await h.post(p)).status, 409); unchanged(h, before);
    });
  }
}
for (const payload of [null, [], {}, {type: 'SALE_APPROVED'}, {...event(), data: null}, {...event(), data: {metadata: {reference: 'order-1'}}}, {...event(), data: {...event().data, metadata: {reference: null}}}, {...event(), data: {...event().data, amount: {total: '20000', currency: 'COP'}}}, {...event(), data: {...event().data, amount: {total: null, currency: 'COP'}}}, {...event(), data: {...event().data, amount: {total: 20000, currency: 'cop'}}}]) {
  test(`malformed sale fails closed ${JSON.stringify(payload).slice(0, 85)}`, async () => {
    const h = harness(); const before = h.db.state(); const r = await h.post(payload);
    assert.ok([400,409].includes(r.status), `unexpected status ${r.status}`); unchanged(h, before);
  });
}
test('invalid JSON and infinite numeric amount fail closed', async () => {
  const h = harness(); const before = h.db.state();
  assert.equal((await h.post('{')).status, 400);
  assert.equal((await h.post(JSON.stringify(event()).replace('20000', '1e999'))).status, 400);
  unchanged(h, before);
});
test('subject is a payment id and never a fallback order reference', async () => {
  const h = harness(); const before = h.db.state(); const p: any = event();
  p.subject = 'order-1'; delete p.data.metadata.reference;
  assert.equal((await h.post(p)).status, 400); unchanged(h, before);
});
test('unknown order acknowledged without mutation', async () => {
  const h = harness(); const before = h.db.state(); const p = event(); p.data.metadata.reference = 'missing';
  assert.equal((await h.post(p)).status, 200); unchanged(h, before);
});
for (const type of ['VOID_APPROVED','VOID_REJECTED','FUTURE_EVENT']) {
  test(`unsupported ${type} acknowledged without any write`, async () => {
    const h = harness(); const before = h.db.state(); assert.equal((await h.post(event(type))).status, 200); unchanged(h, before);
  });
}
test('duplicate and concurrent approvals send only one sale/email', async () => {
  const h = harness(); const responses = await Promise.all([h.post(), h.post(), h.post()]);
  assert.ok(responses.every(r => r.status === 200)); assert.equal((await h.post()).status, 200);
  assert.deepEqual(h.deliveries, ['sale','email']); assert.equal(h.db.state()[0][0].status, 'paid');
  assert.equal(h.db.state()[1][0].stock_reserved, 7);
});
test('duplicate and concurrent rejections release inventory exactly once', async () => {
  const h = harness(); const p = event('SALE_REJECTED');
  const responses = await Promise.all([h.post(p), h.post(p), h.post(p)]);
  assert.ok(responses.every(r => r.status === 200)); assert.equal((await h.post(p)).status, 200);
  assert.equal(h.db.state()[0][0].status, 'failed'); assert.equal(h.db.state()[1][0].stock_reserved, 5);
  assert.deepEqual(h.deliveries, []);
});
test('rejection cannot downgrade paid or release stock', async () => {
  const h = harness({}, 'paid'); const before = h.db.state();
  assert.equal((await h.post(event('SALE_REJECTED'))).status, 200); unchanged(h, before);
});
test('late approval after failure requires manual review, never resurrects released stock', async () => {
  const h = harness({}, 'failed'); const before = h.db.state();
  const r = await h.post(); assert.equal(r.status, 409); assert.equal((await json(r)).reason, 'manual_review'); unchanged(h, before);
});
test('mixed approval/rejection races preserve stock and prevent resurrection', async () => {
  for (const rejectionFirst of [false,true]) {
    const h = harness(); const reject = () => h.post(event('SALE_REJECTED'));
    const responses = await Promise.all(rejectionFirst ? [reject(), h.post()] : [h.post(), reject()]);
    const final = h.db.state();
    if (final[0][0].status === 'paid') {
      assert.equal(final[1][0].stock_reserved, 7); assert.deepEqual(h.deliveries, ['sale','email']);
    } else {
      assert.equal(final[0][0].status, 'failed'); assert.equal(final[1][0].stock_reserved, 5); assert.deepEqual(h.deliveries, []);
      assert.ok(responses.some(r => r.status === 409));
    }
  }
});
test('rejection batch rolls inventory back when order update fails', async () => {
  const h = harness(); const before = h.db.state(); h.db.failBatch = true;
  assert.equal((await h.post(event('SALE_REJECTED'))).status, 500);
  assert.deepEqual(h.db.state(), before); assert.deepEqual(h.deliveries, []);
});
test('email failure reports via existing Telegram alert, does not duplicate payment', async () => {
  const h = harness(); h.setEmailFailure(); assert.equal((await h.post()).status, 200);
  assert.deepEqual(h.deliveries, ['sale','email','email-error']);
  assert.equal((await h.post()).status, 200); assert.deepEqual(h.deliveries, ['sale','email','email-error']);
});

test('exported environment helper has exact production/test contract', () => {
  const {getBoldEnvironment} = harness().load(join(root, 'src/lib/bold.ts'));
  assert.equal(getBoldEnvironment({}), 'production');
  assert.equal(getBoldEnvironment({BOLD_ENVIRONMENT: 'production'}), 'production');
  assert.equal(getBoldEnvironment({BOLD_ENVIRONMENT: 'test'}), 'test');
  assert.equal(getBoldEnvironment({ENVIRONMENT: 'staging'}), 'production');
  for (const value of [null, false, 0, '', 'staging', 'TEST', ' test', 'production ']) {
    assert.throws(() => getBoldEnvironment({BOLD_ENVIRONMENT: value}));
  }
});
test('HMAC covers the exact whitespace and UTF-8 body, not reserialized JSON', async () => {
  const raw = JSON.stringify({...event(), note: 'Bogotá 🪷'}, null, 2) + '\n';
  const h = harness({BOLD_ENVIRONMENT: 'production'});
  assert.equal((await h.post(raw)).status, 200);
  const tampered = harness(); const before = tampered.db.state();
  assert.equal((await tampered.post(raw + ' ', '', sign(raw, 'dummy-production-secret'))).status, 401);
  unchanged(tampered, before);
});
test('oversized authenticated or unauthenticated input is bounded', async () => {
  const h = harness(); const before = h.db.state();
  const r = await h.post('x'.repeat(65537));
  assert.equal(r.status, 413); assert.equal(r.headers.get('cache-control'), 'no-store'); unchanged(h, before);
});
test('sale subject/payment_id disagreement is malformed, never an order fallback', async () => {
  const h = harness(); const before = h.db.state(); const p = event(); p.subject = 'other-payment';
  assert.equal((await h.post(p)).status, 400); unchanged(h, before);
});
test('even duplicate paid notifications must match the original amount/currency', async () => {
  const h = harness({}, 'paid'); const before = h.db.state(); const p = event(); p.data.amount.total = 1;
  assert.equal((await h.post(p)).status, 409); unchanged(h, before);
});
for (const setup of [
  'DELETE FROM inventory',
  'UPDATE inventory SET stock_reserved = 1',
  "UPDATE inventory SET event_date = '2026-12-02'",
  'UPDATE orders SET quantity = 0',
  "UPDATE orders SET event_date = ''",
]) {
  test(`rejection with inconsistent reservation requires manual review: ${setup}`, async () => {
    const h = harness(); h.db.execute([{sql: setup, params: []}]); const before = h.db.state();
    const r = await h.post(event('SALE_REJECTED'));
    assert.equal(r.status, 409); assert.equal((await json(r)).reason, 'manual_review');
    assert.deepEqual(h.db.state(), before); assert.deepEqual(h.deliveries, []);
  });
}
test('unknown local order state is not a payment transition', async () => {
  const h = harness({}, 'cancelled'); const before = h.db.state();
  assert.equal((await h.post()).status, 409); unchanged(h, before);
});
test('status database failure fails closed with no-store and no internal details', async () => {
  const h = harness({DB: undefined}); const before = h.db.state();
  for (const r of [await h.status(), await h.verify({boldOrderId: 'order-1'}), await h.post()]) {
    assert.equal(r.status, 500); assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await r.json(), {error: 'Internal error'});
  }
  unchanged(h, before);
});
