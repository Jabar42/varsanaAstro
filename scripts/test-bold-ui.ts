/** Exercise the real React component with isolated hooks and browser bindings. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/components/BoldPaymentButton.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

async function renderResult(status: string, query = 'approved', locale = 'es', fails = false) {
  const effects: Array<() => void | (() => void)> = [];
  const phases: unknown[] = [];
  const successes: string[] = [];
  const errors: unknown[] = [];
  const redirects: string[] = [];
  const fetches: Array<{ url: string; options: RequestInit }> = [];
  let stateIndex = 0;
  const react = {
    useState(value: unknown) {
      const index = stateIndex++;
      return [value, (next: unknown) => { if (index === 0) phases.push(next); }];
    },
    useEffect(effect: () => void | (() => void)) { effects.push(effect); },
    useCallback(fn: unknown) { return fn; },
    useMemo(fn: () => unknown) { return fn(); },
    useRef(value: unknown) { return { current: value }; },
  };
  const exports: Record<string, any> = {};
  runInNewContext(compiled, {
    exports,
    require(name: string) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    window: { BoldCheckout: function () {}, history: { replaceState() {} }, location: {
      search: `?bold-order-id=fixture&bold-tx-status=${query}`,
      pathname: '/pasadias/example',
      href: `https://varsana-co.iaforchange.workers.dev/pasadias/example?bold-order-id=fixture&bold-tx-status=${query}`,
      assign: (url: string) => redirects.push(url),
    } },
    URL, URLSearchParams, AbortController, console, setTimeout, clearTimeout, setInterval, clearInterval,
    fetch: async (url: string, options: RequestInit) => {
      fetches.push({ url, options });
      if (fails) throw new Error('fixture network failure');
      return new Response(JSON.stringify({ status }), { status: 200 });
    },
  });
  exports.default({ contentType: 'pasadia', contentId: 'example', prices: [{ label: 'Adulto', amount: 50000 }],
    locale, onSuccess: (id: string) => successes.push(id), onError: (error: unknown) => errors.push(error) });
  const cleanups = effects.map(effect => effect());
  for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve));
  cleanups.forEach(cleanup => { if (typeof cleanup === 'function') cleanup(); });
  return { phases, successes, errors, redirects, fetches };
}

test('forged approved URL never marks pending order successful', async () => {
  const result = await renderResult('pending');
  assert.equal(result.successes.length, 0);
  assert.ok(!result.phases.includes('success'));
  assert.deepEqual(result.redirects, ['/pago/exito?bold-order-id=fixture']);
  assert.equal(result.fetches[0].options.cache, 'no-store');
});

test('confirmed D1 paid status, not redirect declined status, authorizes success', async () => {
  const result = await renderResult('paid', 'declined');
  assert.deepEqual(result.successes, ['fixture']);
  assert.ok(result.phases.includes('success'));
  assert.equal(result.redirects.length, 0);
});

test('D1 failed and refunded never show success despite approved redirect', async () => {
  for (const status of ['failed', 'refunded']) {
    const result = await renderResult(status);
    assert.equal(result.successes.length, 0);
    assert.ok(result.phases.includes('error'));
  }
});

test('unknown result preserves English result URL and order reference', async () => {
  const result = await renderResult('not_found', 'approved', 'en');
  assert.deepEqual(result.redirects, ['/en/pago/exito?bold-order-id=fixture']);
  assert.equal(result.successes.length, 0);
});

test('network failure is never treated as payment success', async () => {
  const result = await renderResult('paid', 'approved', 'es', true);
  assert.equal(result.successes.length, 0);
  assert.ok(result.phases.includes('error'));
  assert.equal(result.errors.length, 1);
});
