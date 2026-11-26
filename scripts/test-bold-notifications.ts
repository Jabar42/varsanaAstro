import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual email/Telegram modules AND email template. Replace only
// runtime bindings, external delivery SDK/fetch, rendering, and the clock.
const root = process.cwd();
const nativeRequire = createRequire(import.meta.url);
const dummy = {
  RESEND_API_KEY: 'dummy-resend-secret',
  RESEND_FROM_EMAIL: 'Varsana <dummy@example.invalid>',
  TELEGRAM_BOT_TOKEN: '000:dummy-telegram-secret',
  TELEGRAM_CHAT_ID: '-000',
};
const order = {
  bold_order_id: 'notification-order-1', customer_email: 'customer@example.invalid',
  customer_name: 'Cliente', content_title: 'Retiro', content_type: 'event' as const,
  event_date: '2026-12-01', ticket_details: [{label: 'General', amount: 20000, quantity: 2}],
  amount: 40000, currency: 'COP',
};
const failure = 'Order confirmation email unavailable';

function harness(config: Record<string, unknown> = {}, realSDK = false, realRender = false) {
  const env: Record<string, unknown> = {...dummy, ...config};
  const logs: string[] = [];
  const keys: string[] = [];
  const sends: {payload: any; options: any}[] = [];
  const transports: {path: string; options: RequestInit}[] = [];
  const requests: {url: string; init: RequestInit}[] = [];
  const rendered: any[] = [];
  const timers = new Map<number, {callback: () => void; delay: number}>();
  let nextTimer = 0;
  const state = {
    constructError: false,
    send: async (): Promise<any> => ({data: {id: 'dummy-message'}, error: null}),
    render: async (_tree: unknown): Promise<string> => '<html>dummy-rendered-template</html>',
    fetch: async (_url: string, _init: RequestInit): Promise<Response> => Response.json({ok: true}),
  };
  class MockResend {
    constructor(key: string) {
      keys.push(key);
      if (state.constructError) throw new Error(`${dummy.RESEND_API_KEY}: constructor failed`);
    }
    emails = {send: async (payload: any, options: any) => {
      sends.push({payload, options});
      return this.fetchRequest('/emails', {method: 'POST', body: JSON.stringify(payload)});
    }};
    async fetchRequest(path: string, options: RequestInit) {
      transports.push({path, options});
      return state.send();
    }
  }
  const cache = new Map<string, any>();
  const load = (file: string): any => {
    if (cache.has(file)) return cache.get(file);
    const source = readFileSync(join(root, file), 'utf8');
    const output = ts.transpileModule(source, {compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
    }, fileName: file}).outputText;
    const exports = {};
    cache.set(file, exports);
    const require = (id: string): any => {
      if (id === 'cloudflare:workers') return {env};
      if (id === 'resend') return realSDK ? nativeRequire(id) : {Resend: MockResend};
      if (id === 'react-email') return {...nativeRequire(id), render: async (tree: unknown) => {
        rendered.push(tree);
        return realRender ? nativeRequire(id).render(tree) : state.render(tree);
      }};
      if (id === '@/src/emails/OrderConfirmationEmail') return load('src/emails/OrderConfirmationEmail.tsx');
      if (id === 'react/jsx-runtime') return nativeRequire(id);
      throw new Error(`Unexpected import: ${id}`);
    };
    vm.runInNewContext(`(function(require,module,exports){${output}\n})`, {
      AbortController, URL, Request, Response, Headers,
      fetch: async (url: string, init: RequestInit) => {requests.push({url, init}); return state.fetch(url, init);},
      setTimeout: (callback: () => void, delay: number) => {const id = ++nextTimer; timers.set(id, {callback, delay}); return id;},
      clearTimeout: (id: number) => {timers.delete(id);},
      console: Object.fromEntries(['log', 'warn', 'error'].map(level => [level, (...args: unknown[]) => logs.push(args.join(' '))])),
    }, {filename: file})(require, {exports}, exports);
    return exports;
  };
  const email = load('src/lib/email.ts');
  const telegram = load('src/lib/telegram.ts');
  return {env, logs, keys, sends, transports, requests, rendered, timers, state, email, telegram,
    expire() { for (const {callback} of [...timers.values()]) callback(); },
    safe() {
      assert.ok(!logs.join(' ').includes(dummy.RESEND_API_KEY));
      assert.ok(!logs.join(' ').includes(dummy.TELEGRAM_BOT_TOKEN));
      assert.ok(!logs.join(' ').includes('api.telegram.org/bot'));
      assert.equal(timers.size, 0, 'deadline timer cleaned up');
    },
  };
}
async function tick() { for (let i = 0; i < 20; i++) await Promise.resolve(); }

for (const file of ['email', 'telegram']) {
  test(`${file}: runtime bindings only, no build-time configuration`, () => {
    const source = readFileSync(join(root, `src/lib/${file}.ts`), 'utf8');
    assert.ok(source.includes("from 'cloudflare:workers'"));
    assert.ok(!source.includes('import.meta.env'));
  });
}
for (const name of ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']) {
  for (const value of [undefined, '', '   ', 123]) {
    test(`email fails closed without valid runtime ${name}: ${String(value)}`, async () => {
      const h = harness({[name]: value});
      await assert.rejects(h.email.sendOrderConfirmationEmail(order), {message: failure});
      assert.equal(h.keys.length, 0); assert.equal(h.sends.length, 0); assert.equal(h.rendered.length, 0);
      h.safe();
    });
  }
}
test('email retains recipient, subject, template fields and Resend idempotency key', async () => {
  const h = harness();
  await h.email.sendOrderConfirmationEmail(order);
  await h.email.sendOrderConfirmationEmail(order);
  assert.deepEqual(h.keys, [dummy.RESEND_API_KEY, dummy.RESEND_API_KEY]);
  assert.equal(h.sends.length, 2);
  for (const {payload, options} of h.sends) {
    assert.deepEqual(JSON.parse(JSON.stringify(payload)), {
      from: dummy.RESEND_FROM_EMAIL, to: [order.customer_email],
      subject: 'Confirmación de tu reserva: Retiro', html: '<html>dummy-rendered-template</html>',
    });
    assert.equal(options.idempotencyKey, `order-confirmation/${order.bold_order_id}`);
  }
  const tree = JSON.stringify(h.rendered[0]);
  for (const text of ['Cliente', 'Retiro', 'Evento', 'General', 'notification-order-1', 'COP', '1 de diciembre de 2026']) {
    assert.ok(tree.includes(text), `real template retains ${text}`);
  }
  assert.ok(h.transports[0].options.signal instanceof AbortSignal);
  h.safe();
});
test('email reads changed runtime bindings per call without stale client cache', async () => {
  const h = harness();
  await h.email.sendOrderConfirmationEmail(order);
  h.env.RESEND_API_KEY = 'dummy-rotated-key'; h.env.RESEND_FROM_EMAIL = 'rotated@example.invalid';
  await h.email.sendOrderConfirmationEmail(order);
  assert.deepEqual(h.keys, [dummy.RESEND_API_KEY, 'dummy-rotated-key']);
  assert.equal(h.sends[1].payload.from, 'rotated@example.invalid'); h.safe();
});
test('email preserves pasadia subject and Reserva fallback for invalid/empty ticket details', async () => {
  for (const ticket_details of [null, '[]', []]) {
    const h = harness();
    await h.email.sendOrderConfirmationEmail({...order, content_type: 'pasadia', ticket_details});
    assert.equal(h.sends[0].payload.subject, 'Confirmación de tu pasadía: Retiro');
    const tree = JSON.stringify(h.rendered[0]);
    assert.ok(tree.includes('Reserva')); assert.ok(tree.includes('Pasadía')); h.safe();
  }
});
test('email normalizes malformed ticket entries without rejecting the template', async () => {
  const h = harness();
  await h.email.sendOrderConfirmationEmail({...order, ticket_details: [null, {}, {label: 'Special', amount: 50, quantity: 3}]});
  const tree = JSON.stringify(h.rendered[0]);
  assert.ok(tree.includes('Ticket')); assert.ok(tree.includes('Special')); h.safe();
});
for (const stage of ['construct', 'render', 'throw', 'error', 'empty']) {
  test(`email ${stage} failure is generic, secret-free and propagated`, async () => {
    const h = harness();
    const sensitive = `${dummy.RESEND_API_KEY} ${dummy.TELEGRAM_BOT_TOKEN}`;
    if (stage === 'construct') h.state.constructError = true;
    if (stage === 'render') h.state.render = async () => {throw new Error(sensitive);};
    if (stage === 'throw') h.state.send = async () => {throw new Error(sensitive);};
    if (stage === 'error') h.state.send = async () => ({data: null, error: {message: sensitive, name: sensitive}});
    if (stage === 'empty') h.state.send = async () => ({data: null, error: null});
    await assert.rejects(h.email.sendOrderConfirmationEmail(order), {message: failure});
    if (stage === 'render') assert.equal(h.sends.length, 0);
    h.safe();
  });
}
test('email timeout aborts transport and bounds even an uncooperative SDK', async () => {
  const h = harness(); h.state.send = () => new Promise(() => {});
  const delivery = h.email.sendOrderConfirmationEmail(order);
  await tick();
  assert.deepEqual([...h.timers.values()].map(t => t.delay), [10_000]);
  assert.equal(h.transports.length, 1);
  h.expire(); await assert.rejects(delivery, {message: failure});
  assert.equal(h.transports[0].options.signal?.aborted, true); h.safe();
});
test('timed-out rendering cannot start a late email send', async () => {
  const h = harness(); let finish!: (html: string) => void;
  h.state.render = () => new Promise(resolve => {finish = resolve;});
  const delivery = h.email.sendOrderConfirmationEmail(order);
  h.expire(); await assert.rejects(delivery, {message: failure});
  finish('<html>late</html>'); await tick();
  assert.equal(h.sends.length, 0); h.safe();
});
for (const name of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']) {
  for (const value of [undefined, '', '   ', 123]) {
    test(`Telegram remains silent no-op without valid runtime ${name}: ${String(value)}`, async () => {
      const h = harness({[name]: value}); await h.telegram.sendTelegramMessage('message');
      assert.equal(h.requests.length, 0); assert.deepEqual(h.logs, []); h.safe();
    });
  }
}
test('Telegram token appears only in destination, preserving HTML send contract and runtime rotation', async () => {
  const h = harness(); const text = '<b>Reserva</b>';
  await h.telegram.sendTelegramMessage(text);
  const {url, init} = h.requests[0];
  assert.equal(url, `https://api.telegram.org/bot${dummy.TELEGRAM_BOT_TOKEN}/sendMessage`);
  assert.equal(init.method, 'POST'); assert.equal((init.headers as any)['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(init.body as string), {chat_id: dummy.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML'});
  assert.ok(!JSON.stringify(init).includes(dummy.TELEGRAM_BOT_TOKEN));
  assert.ok(init.signal instanceof AbortSignal);
  h.env.TELEGRAM_BOT_TOKEN = '000:dummy-rotated'; h.env.TELEGRAM_CHAT_ID = '-111';
  await h.telegram.sendTelegramMessage(text);
  assert.ok(h.requests[1].url.includes('000:dummy-rotated'));
  assert.equal(JSON.parse(h.requests[1].init.body as string).chat_id, '-111'); h.safe();
});
for (const mode of ['network', 'http', 'body', 'malformed', 'null', 'missing-ok']) {
  test(`Telegram ${mode} failure logs generic error and never throws`, async () => {
    const h = harness();
    h.state.fetch = async (url: string) => {
      if (mode === 'network') throw new Error(`fetch failed ${url}`);
      if (mode === 'http') return Response.json({ok: false, description: dummy.TELEGRAM_BOT_TOKEN}, {status: 429});
      if (mode === 'body') return Response.json({ok: false, description: dummy.TELEGRAM_BOT_TOKEN});
      if (mode === 'malformed') return new Response(dummy.TELEGRAM_BOT_TOKEN);
      return Response.json(mode === 'null' ? null : {});
    };
    await assert.doesNotReject(h.telegram.sendTelegramMessage('message'));
    assert.deepEqual(h.logs, ['[telegram] sendMessage failed']); h.safe();
  });
}
for (const phase of ['fetch', 'body']) {
  test(`Telegram timeout bounds ${phase}, aborts, and keeps no-throw contract`, async () => {
    const h = harness();
    h.state.fetch = async () => phase === 'fetch'
      ? await new Promise<Response>(() => {})
      : {ok: true, json: () => new Promise(() => {})} as Response;
    const delivery = h.telegram.sendTelegramMessage('message'); await tick();
    assert.deepEqual([...h.timers.values()].map(t => t.delay), [5_000]);
    h.expire(); await assert.doesNotReject(delivery);
    assert.equal(h.requests[0].init.signal?.aborted, true);
    assert.deepEqual(h.logs, ['[telegram] sendMessage failed']); h.safe();
  });
}
test('Telegram message builders escape all dynamic HTML while retaining labels and totals', () => {
  const h = harness(); const untrusted = `<b>&"'</b>`;
  const escaped = '&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;';
  const sale = h.telegram.buildSaleMessage({...order, customer_name: untrusted, customer_email: untrusted,
    content_title: untrusted, event_date: untrusted, bold_order_id: untrusted});
  assert.equal(sale.split(escaped).length - 1, 5);
  assert.ok(sale.includes('<b>Nueva reserva</b>')); assert.ok(sale.includes('<b>Total:</b> $40.000'));
  assert.ok(sale.includes(`<code>${escaped}</code>`));
  const error = h.telegram.buildEmailErrorMessage(untrusted, untrusted);
  assert.equal(error.split(escaped).length - 1, 2); assert.ok(error.includes('Email de confirmación falló'));
});
test('real Resend SDK and real React Email template use abort signal, runtime key, HTML and idempotency header', async () => {
  // Narrow SDK compatibility probe: actual SDK transport, only network mocked.
  const h = harness({}, true, true);
  const original = globalThis.fetch;
  const calls: {url: string; init: RequestInit}[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({url: String(url), init: init!});
    return Response.json({id: 'dummy-real-sdk-message'});
  };
  try {
    await h.email.sendOrderConfirmationEmail(order);
    assert.equal(calls.length, 1); const {url, init} = calls[0];
    assert.equal(url, 'https://api.resend.com/emails');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('authorization'), `Bearer ${dummy.RESEND_API_KEY}`);
    assert.equal(headers.get('idempotency-key'), `order-confirmation/${order.bold_order_id}`);
    assert.ok(init.signal instanceof AbortSignal);
    const body = JSON.parse(init.body as string);
    for (const text of ['Cliente', 'Retiro', 'General', 'notification-order-1', 'Tu reserva ha sido confirmada']) {
      assert.ok(body.html.includes(text), `rendered HTML contains ${text}`);
    }
    h.safe();
  } finally {globalThis.fetch = original;}
});
