import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { es as gardenEs, en as gardenEn } from '../src/i18n/dictionaries/huertaPage';
import { es as foodEs, en as foodEn } from '../src/i18n/dictionaries/alimentacionPage';
import { es as practiceEs, en as practiceEn } from '../src/i18n/dictionaries/practicaPage';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const practice = read('src/pages/practica-espiritual.astro');
const food = read('src/pages/alimentacion.astro');
const garden = read('src/pages/experiencias/huerta.astro');
const manifest = JSON.parse(read('docs/change-requests/2026-11-27-gopi-images.json'));
const vite = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  configFile: false,
  server: { middlewareMode: true, watch: null, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
});
let utils: typeof import('../src/i18n/utils');
try { utils = await vite.ssrLoadModule('/src/i18n/utils.ts') as typeof utils; }
finally { await vite.close(); }
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

test('VC-261127-01: community photos replace both placeholders in requested order', () => {
  const section = practice.slice(practice.indexOf('id="comunidad"'));
  const imgs = [...section.matchAll(/<img[\s\S]*?\/>/g)].map(x => x[0]);
  assert.equal(imgs.length, 2);
  assert.match(imgs[0], /practica-comunidad-encuentro-20261127.webp/);
  assert.match(imgs[1], /practica-comunidad-festival-20261127.webp/);
  for (const img of imgs) {
    assert.match(img, /width="1200"/);
    assert.match(img, /height="(?:900|800)"/);
    assert.match(img, /loading="lazy"/);
    assert.match(img, /aspect-4\/3/);
  }
  assert.doesNotMatch(practice, /picsum/);
});

test('VC-261127-02: food banner uses the approved edited image, not the image with former members', () => {
  assert.match(food, /<PageBanner[\s\S]*?image="\/api\/images\/alimentacion-mesa-verduras-20261127.webp"/);
  assert.match(food, /imageAlt=\{t\('alimentacionPage.banner.imageAlt'\)\}/);
  const images = manifest.images.filter((x: {code: string}) => x.code === 'VC-261127-02');
  assert.equal(images.length, 1);
  assert.equal(images[0].source_original_name, 'Puesto orgánico lleno de color.png');
  assert.deepEqual(images[0].crop, [0, 450, 1537, 1023]);
});

test('VC-261127-03: food garden photos are in requested order, lazy and dimensioned', () => {
  const imgs = [...food.matchAll(/<img[\s\S]*?\/>/g)].map(x => x[0]);
  assert.equal(imgs.length, 2);
  assert.match(imgs[0], /alimentacion-huerta-cosecha-20261127.webp/);
  assert.match(imgs[0], /width="900"[\s\S]*height="1200"/);
  assert.match(imgs[1], /alimentacion-huerta-productos-20261127.webp/);
  assert.match(imgs[1], /width="1200"[\s\S]*height="800"/);
  assert.match(imgs[1], /object-left/);
  for (const img of imgs) assert.match(img, /loading="lazy"/);
  assert.doesNotMatch(food, /picsum/);
});

test('VC-261127-04: exact approved title and quotation, with the provided garden image', () => {
  assert.equal(gardenEs.title, 'Huerta Varsana');
  assert.equal(gardenEs.subtitle, '"Si alguien Me ofrece con amor y devoción una hoja, una flor, una fruta o agua, Yo lo acepto." — Bhagavad-gītā Tal Como Es 9.26');
  assert.match(garden, /<PageBanner[\s\S]*?title=\{t\('huertaPage.title'\)\}[\s\S]*?subtitle=\{t\('huertaPage.subtitle'\)\}/);
  assert.match(garden, /image="\/api\/images\/huerta-varsana-banner-20261127.webp"/);
  assert.match(garden, /huertaPage.comingSoon/);
  assert.equal(gardenEs.comingSoon, 'Próximamente');
  assert.doesNotMatch(garden, /BoldPaymentButton|checkout|prices|\$\d/);
});

test('new and updated dictionaries have matching ES/EN shapes and load through the real i18n loader', () => {
  for (const [namespace, es, en] of [['huertaPage', gardenEs, gardenEn], ['alimentacionPage', foodEs, foodEn], ['practicaPage', practiceEs, practiceEn]] as const) {
    assert.deepEqual(shape(es), shape(en));
    for (const [locale, dict] of [['es', es], ['en', en]] as const) {
      const t = utils.useTranslations(locale);
      if (namespace === 'huertaPage') assert.equal(t('huertaPage.title'), (dict as typeof gardenEs).title);
      if (namespace === 'alimentacionPage') assert.equal(t('alimentacionPage.banner.imageAlt'), (dict as typeof foodEs).banner.imageAlt);
      if (namespace === 'practicaPage') assert.equal(t('practicaPage.comunidad.image1Alt'), (dict as typeof practiceEs).comunidad.image1Alt);
    }
  }
});

test('garden breadcrumb and return links are localized without changing the main /huerta route', () => {
  for (const path of ['/', '/experiencias', '/experiencias/huerta']) {
    assert.ok(garden.includes(`l('${path}')`));
    assert.equal(utils.localizePath('en', path), path === '/' ? '/en' : `/en${path}`);
  }
  assert.equal(read('src/pages/huerta.astro').includes('ComingSoon'), true);
});

test('provenance covers precisely the four requests and six unique optimized assets', () => {
  assert.deepEqual(manifest.requests, ['VC-261127-01', 'VC-261127-02', 'VC-261127-03', 'VC-261127-04']);
  assert.equal(manifest.images.length, 6);
  assert.equal(new Set(manifest.images.map((x: {key: string}) => x.key)).size, 6);
  for (const image of manifest.images) {
    assert.ok(image.bytes > 0 && image.bytes < 150000);
    assert.ok(image.width <= 1200 && image.height <= 1200);
    assert.match(image.sha256, /^[a-f0-9]{64}$/);
    assert.match(image.source_sha256, /^[a-f0-9]{64}$/);
    assert.equal(image.url, `/api/images/${image.key}`);
  }
});
