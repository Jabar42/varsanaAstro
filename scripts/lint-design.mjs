#!/usr/bin/env node
/**
 * Valida DESIGN.md: estructura de los tokens, referencias `{grupo.token}` y
 * contraste WCAG AA de cada componente que declara fondo y texto.
 *
 * Usage: node scripts/lint-design.mjs [DESIGN.md path]
 * Sale con código 1 si hay errores; las advertencias no bloquean.
 */

import { readFileSync } from "node:fs";
import { load as yamlParse } from "js-yaml";

const designPath = process.argv[2] || "DESIGN.md";
const source = readFileSync(designPath, "utf8");

const errors = [];
const warnings = [];

const fmMatch = source.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error("✖ No se encontró frontmatter YAML en %s", designPath);
  process.exit(1);
}

let tokens;
try {
  tokens = yamlParse(fmMatch[1]);
} catch (err) {
  console.error("✖ El frontmatter no es YAML válido: %s", err.message);
  process.exit(1);
}

// ── Estructura ──────────────────────────────────────────────
for (const key of ["name", "colors", "typography", "rounded", "spacing", "components"]) {
  if (tokens[key] === undefined) errors.push(`Falta la sección \`${key}\``);
}

const HEX = /^#[0-9a-f]{6}$/i;
for (const [name, value] of Object.entries(tokens.colors ?? {})) {
  if (!HEX.test(String(value))) errors.push(`colors.${name}: «${value}» no es un hex de 6 dígitos`);
}

for (const [name, spec] of Object.entries(tokens.typography ?? {})) {
  for (const field of ["fontFamily", "fontSize", "fontWeight", "lineHeight"]) {
    if (spec?.[field] === undefined) errors.push(`typography.${name}: falta \`${field}\``);
  }
}

for (const [name, value] of Object.entries(tokens.rounded ?? {})) {
  if (!/^\d+px$/.test(String(value))) errors.push(`rounded.${name}: «${value}» debe estar en px`);
}

// ── Referencias ─────────────────────────────────────────────
/** Resuelve `{colors.x}`; devuelve el valor literal si no es una referencia. */
function resolve(value, where) {
  if (typeof value !== "string") return value;
  const ref = value.match(/^\{([\w-]+)\.([\w-]+)\}$/);
  if (!ref) return value;
  const resolved = tokens[ref[1]]?.[ref[2]];
  if (resolved === undefined) {
    errors.push(`${where}: la referencia ${value} no existe`);
    return undefined;
  }
  return resolved;
}

// ── Contraste ───────────────────────────────────────────────
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pageBackground = resolve(tokens.components?.["background-page"]?.backgroundColor, "background-page") ?? "#ffffff";
let checked = 0;

for (const [name, spec] of Object.entries(tokens.components ?? {})) {
  const where = `components.${name}`;
  const bgRaw = resolve(spec.backgroundColor, where);
  const fg = resolve(spec.textColor, where);
  if (spec.rounded) resolve(spec.rounded, where);
  if (spec.typography && tokens.typography?.[spec.typography] === undefined) {
    errors.push(`${where}: la tipografía «${spec.typography}» no existe`);
  }
  if (!fg || !HEX.test(fg)) continue;

  // Sin fondo propio (o transparente) el texto cae sobre el fondo de página.
  const bg = bgRaw && HEX.test(bgRaw) ? bgRaw : pageBackground;
  const ratio = contrast(bg, fg);
  checked++;

  // Los íconos son gráficos (WCAG 1.4.11: 3:1); un control deshabilitado está
  // exento, pero se avisa si queda ilegible.
  const isGraphic = name.startsWith("icon-");
  const isDisabled = name.endsWith("-disabled");
  const min = isGraphic || isDisabled ? 3 : 4.5;
  const label = `${where}: ${fg} sobre ${bg} = ${ratio.toFixed(2)}:1 (mínimo ${min}:1)`;

  if (ratio < min) (isDisabled ? warnings : errors).push(label);
}

// ── Reporte ─────────────────────────────────────────────────
for (const w of warnings) console.warn("⚠ %s", w);
for (const e of errors) console.error("✖ %s", e);

if (errors.length) {
  console.error("\n%s: %d error(es), %d advertencia(s)", designPath, errors.length, warnings.length);
  process.exit(1);
}
console.log(
  "✓ %s: %d colores, %d componentes con contraste AA verificado, %d advertencia(s)",
  designPath,
  Object.keys(tokens.colors ?? {}).length,
  checked,
  warnings.length
);
