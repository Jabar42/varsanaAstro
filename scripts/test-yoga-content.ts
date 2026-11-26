/** Run with: npx tsx scripts/test-yoga-content.ts */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { es, en } from '../src/i18n/dictionaries/yogaPage';

// The real i18n loader uses Vite's import.meta.glob, which raw tsx cannot run.
// Load it through Vite without the Astro/Cloudflare config, HTTP server or D1.
const vite = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  configFile: false,
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
let utils: typeof import('../src/i18n/utils');
try {
  utils = await vite.ssrLoadModule('/src/i18n/utils.ts') as typeof utils;
} finally {
  await vite.close();
}
const { localizePath, useTranslations } = utils;

const page = readFileSync(new URL('../src/pages/experiencias/yoga.astro', import.meta.url), 'utf8');
const section = (start: string, end: string) => {
  const from = page.indexOf(start);
  const to = page.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Section boundaries exist: ${start}, ${end}`);
  return page.slice(from, to);
};
const expectedIntroEs = [
  'Un espacio para parar, respirar y volver a tu cuerpo, de la mano del Yoga Inbound.',
  'En Varsana, el yoga empieza por lo más sencillo: una respiración, un movimiento, un momento de silencio. Desde nuestros inicios hace parte de la vida diaria de la comunidad, y se practica junto a maestros que siguen recorriendo su propio camino y enseñan desde esa experiencia.',
  'Las clases están abiertas a todas las personas que quieran indagar, conocer y practicar. Te acompañan a escuchar tu cuerpo, a calmar la mente y a notar qué pasa cuando te detienes un momento. No hay nada que lograr. Hay un espacio, tiempo y personas practicando a tu lado.',
  'Si algo de esto resuena contigo, ven a visitarnos y profundiza en el cuidado de tu mente, tu cuerpo y tu alma.',
];
const expectedFaqEs = [
  '¿Qué debe llevar el estudiante?',
  '¿Debe llevar mat de yoga?',
  '¿Cuál es la duración de cada clase?',
  '¿Qué nivel se requiere: inicial, intermedio, avanzado o todos?',
  '¿Cuál es la edad mínima?',
  '¿Con qué frecuencia se realizan las clases?',
  '¿Es necesario reservar previamente?',
];
const expectedFaqEn = [
  'What should the student bring?',
  'Do I need to bring a yoga mat?',
  'How long is each class?',
  'What level is required: beginner, intermediate, advanced or all levels?',
  'What is the minimum age?',
  'How often are classes held?',
  'Do I need to book in advance?',
];
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

test('ES/EN dictionaries have the same complete shape, including array lengths', () => {
  assert.deepEqual(shape(en), shape(es));
});

test('banner, metadata and shared WhatsApp label are translated and wired into i18n', () => {
  for (const [locale, dict, subtitle, cta] of [
    ['es', es, 'Un viaje al interior del ser', 'Programa tu clase'],
    ['en', en, 'A journey within', 'Schedule your class'],
  ] as const) {
    const t = useTranslations(locale);
    assert.equal(dict.bannerTitle, 'Yoga Inbound');
    assert.equal(dict.bannerSubtitle, subtitle);
    assert.match(dict.metaTitle, /^Yoga Inbound \| Varsana/);
    assert.match(dict.metaDescription, /Yoga Inbound/);
    assert.equal(dict.ctaWhatsapp, cta);
    assert.equal(dict.final.cta, cta);
    for (const key of ['bannerTitle', 'bannerSubtitle', 'metaTitle', 'metaDescription', 'ctaWhatsapp'] as const) {
      assert.equal(t(`yogaPage.${key}`), dict[key]);
    }
  }
});

test('only the centered WhatsApp CTA remains above the introduction', () => {
  const top = section('<!-- CTA row -->', '<!-- Introducción -->');
  assert.equal((top.match(/<a\s/g) ?? []).length, 1);
  assert.match(top, /justify-center/);
  assert.match(top, /href=\{WHATSAPP_URL\}/);
  assert.match(top, /yogaPage\.ctaWhatsapp/);
  assert.doesNotMatch(top, /certification|certificacion|Certification|yoga-terapeutico|GraduationCap/);
  assert.match(page, /const WHATSAPP_URL = 'https:\/\/wa\.me\/573214538242';/);
  const certification = section('<!-- CTA certificación -->', '<!-- CTA final -->');
  assert.match(certification, /href=\{l\('\/experiencias\/yoga-terapeutico'\)\}/);
  assert.match(certification, /yogaPage\.certificacion\.heading/);
});

test('introduction retains the approved four paragraphs in order', () => {
  assert.equal(es.introHeading, 'Yoga en Varsana');
  assert.deepEqual(es.introParagraphs, expectedIntroEs);
  assert.equal(en.introHeading, 'Yoga at Varsana');
  assert.deepEqual(en.introParagraphs, [
    'A space to pause, breathe and reconnect with your body through Yoga Inbound.',
    'At Varsana, yoga begins with the simplest things: a breath, a movement, a moment of silence. It has been part of daily life in the community since our beginnings, and is practised alongside teachers who continue to follow their own path and teach from that experience.',
    'Classes are open to anyone who wants to explore, learn and practise. They help you listen to your body, calm your mind and notice what happens when you pause for a moment. There is nothing to achieve. There is space, time and people practising alongside you.',
    'If any of this resonates with you, come visit us and deepen your care for your mind, body and soul.',
  ]);
  assert.match(section('<!-- Introducción -->', '<!-- Modalidad presencial -->'), /introParagraphs\.map/);
});

test('in-person cards preserve order, real localized destinations and keyboard focus', () => {
  assert.deepEqual(es.modalidad, {
    heading: 'Modalidad Presencial',
    subtitle: 'Encuéntrate con la práctica del Yoga Inbound en Varsana.',
    cardTitle: 'Horarios',
    cardText: 'Un trato más personalizado',
  });
  assert.equal(en.modalidad.heading, 'In-person Practice');
  assert.equal(en.modalidad.cardTitle, 'Class Times');
  assert.equal(en.modalidad.cardText, 'A more personalised approach');
  assert.deepEqual(es.locations.map(({ name }) => name), ['Experiencias que incluyen yoga', 'Formación para Instructores']);
  assert.equal(es.locations[1].address, 'Aprende a compartir este conocimiento profesionalmente');
  assert.deepEqual(en.locations.map(({ name }) => name), ['Experiences that include yoga', 'Instructor Training']);
  assert.equal(en.locations[1].address, 'Learn to share this knowledge professionally');
  for (const [locale, dict, prefix] of [['es', es, ''], ['en', en, '/en']] as const) {
    assert.deepEqual(dict.locations.map(({ href }) => localizePath(locale, href)), [
      `${prefix}/experiencias`, `${prefix}/experiencias/yoga-terapeutico`,
    ]);
    assert.doesNotMatch(JSON.stringify(dict.modalidad), /virtual|online/i);
    assert.doesNotMatch(dict.final.text, /virtual|online/i);
  }
  const modality = section('<!-- Modalidad presencial -->', '<!-- Qué incluye -->');
  assert.ok(modality.indexOf('modalidad.cardTitle') < modality.indexOf('locations.map'));
  assert.doesNotMatch(modality.slice(0, modality.indexOf('locations.map')), /<a\s/);
  assert.match(modality, /<svg[^>]+aria-hidden="true"[^>]+focusable="false"/);
  assert.match(modality, /<a href=\{l\(loc.href\)\}[^>]+focus-visible:outline/);
  assert.match(page, /const locationIcons = \[Leaf, BookOpen\]/);
});

test('includes copy and its three approved items are exact and ordered', () => {
  assert.equal(es.includes.heading, 'Qué incluye la experiencia');
  assert.equal(es.includes.text, 'Prácticas guiadas por maestros de la escuela de Yoga Inbound, en espacios creados para realizar la práctica de manera consciente en medio de la naturaleza, donde es más fácil parar, respirar y volver a ti.');
  assert.deepEqual(es.includes.items, ['Elementos para la práctica', 'Acceso a las instalaciones', 'Material complementario para profundizar']);
  assert.equal(en.includes.heading, 'What the experience includes');
  assert.equal(en.includes.text, 'Practices guided by teachers from the Yoga Inbound school, in spaces created for mindful practice surrounded by nature, where it is easier to pause, breathe and reconnect with yourself.');
  assert.deepEqual(en.includes.items, ['Props for the practice', 'Access to the facilities', 'Supplementary materials for deeper learning']);
});

test('only the first FAQ gains the approved visible structured answer; other questions stay intact', () => {
  assert.deepEqual(es.faq.items, expectedFaqEs);
  assert.deepEqual(en.faq.items, expectedFaqEn);
  assert.equal(es.faq.firstAnswer.text, 'Llega como estás. Para practicar con comodidad, te sugerimos traer:');
  assert.deepEqual(es.faq.firstAnswer.items, [
    'Ropa cómoda que te permita moverte con libertad',
    'Una botella de agua',
    'Ropa de abrigo ligera, porque los espacios están en medio de la naturaleza y la temperatura puede cambiar',
    'Una toalla pequeña (opcional)',
    'Tu propio tapete, si prefieres practicar con el tuyo. Si no, los elementos para la práctica están incluidos.',
  ]);
  assert.equal(en.faq.firstAnswer.text, 'Come as you are. To practise comfortably, we suggest bringing:');
  assert.deepEqual(en.faq.firstAnswer.items, [
    'Comfortable clothing that lets you move freely',
    'A bottle of water',
    'A light warm layer, as the spaces are surrounded by nature and the temperature can change',
    'A small towel (optional)',
    'Your own yoga mat, if you prefer to practise on it. Otherwise, props for the practice are included.',
  ]);
  const faq = section('<!-- FAQ -->', '<!-- CTA certificación -->');
  assert.match(faq, /i === 0 &&/);
  assert.match(faq, /<p>\{dict\.faq\.firstAnswer\.text\}<\/p>/);
  assert.match(faq, /<ul[^>]*>[\s\S]*dict\.faq\.firstAnswer\.items\.map\(\(item\) => <li>\{item\}<\/li>\)/);
  assert.doesNotMatch(faq, /<details|hidden|display:\s*none/);
});

test('readable anchors exist exactly once and keep the page section order', () => {
  let previous = -1;
  for (const id of ['banner', 'yoga-en-varsana', 'modalidad-presencial', 'incluye', 'inversion', 'preguntas-frecuentes']) {
    const marker = `id="${id}"`;
    assert.equal(page.split(marker).length - 1, 1, `${id} is unique`);
    const position = page.indexOf(marker);
    assert.ok(position > previous, `${id} is in order`);
    previous = position;
  }
});

test('unapproved prices are not filled in', () => {
  const investment = section('<!-- Inversión -->', '<!-- FAQ -->');
  assert.equal((investment.match(/\$___/g) ?? []).length, 2);
});

test('both approved photos replace placeholders with lazy loading and real dimensions', () => {
  assert.match(page, /const IMG_INCLUYE = '\/api\/images\/yoga-inbound-practica-incluye-20261125.webp'/);
  assert.match(page, /const IMG_INVERSION = '\/api\/images\/yoga-inbound-clase-grupal-20261125.webp'/);
  assert.doesNotMatch(page, /placeholderNote|border-dashed/);
  for (const key of ['IMG_INCLUYE', 'IMG_INVERSION']) {
    assert.match(page, new RegExp(`src=\\{${key}\\}[\\s\\S]*?width="1200"[\\s\\S]*?height="(?:1200|901)"[\\s\\S]*?loading="lazy"`));
  }
  assert.equal(es.includes.imageAlt, 'Práctica de yoga sentada con los brazos elevados');
  assert.equal(en.inversion.imageAlt, 'Group yoga class in a space open to nature');
});
