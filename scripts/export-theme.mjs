#!/usr/bin/env node
/**
 * Extracts design tokens from DESIGN.md (Google Labs format) and generates
 * Tailwind v4 @theme CSS custom properties.
 *
 * Usage: node scripts/export-theme.mjs [DESIGN.md path] [output.css path]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { load as yamlParse } from "js-yaml";

const designPath = process.argv[2] || "DESIGN.md";
const outputPath = process.argv[3] || "src/styles/design-tokens.css";

const source = readFileSync(designPath, "utf8");

// Extract YAML frontmatter between --- fences
const fmMatch = source.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error("No YAML frontmatter found in", designPath);
  process.exit(1);
}

const tokens = yamlParse(fmMatch[1]);

/** Convert a hex or keyword to a CSS value (lowercase hex) */
function colorValue(v) {
  if (typeof v !== "string") return v;
  if (v === "transparent") return "transparent";
  return v.toLowerCase();
}

/** Build @theme lines from DESIGN.md tokens */
function buildTheme(tokens) {
  const lines = ["@theme {"];

  // ── Colors ────────────────────────────────────────────────
  if (tokens.colors) {
    for (const [name, hex] of Object.entries(tokens.colors)) {
      const val = colorValue(hex);
      lines.push(`  --color-${name}: ${val};`);
    }
  }

  // ── Typography → font families ────────────────────────────
  if (tokens.typography) {
    const families = new Set();
    for (const [, spec] of Object.entries(tokens.typography)) {
      if (spec.fontFamily) families.add(spec.fontFamily);
    }

    const displayFonts = [...families].filter(
      (f) => f === "Proza Libre"
    );
    const sansFonts = [...families].filter(
      (f) => f === "Inter"
    );

    if (displayFonts.length) {
      lines.push(
        `  --font-display: ${JSON.stringify(displayFonts[0])}, sans-serif;`
      );
    }
    if (sansFonts.length) {
      lines.push(
        `  --font-sans: ${JSON.stringify(sansFonts[0])}, ui-sans-serif, system-ui, sans-serif;`
      );
    }
  }

  // ── Border Radius ─────────────────────────────────────────
  if (tokens.rounded) {
    for (const [name, value] of Object.entries(tokens.rounded)) {
      const key = name === "DEFAULT" ? "DEFAULT" : name;
      lines.push(`  --radius-${key}: ${value};`);
    }
  }

  // ── Airbnb shadow (project-specific, not from DESIGN.md YAML) ──
  lines.push(
    "  --shadow-airbnb: 0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.1);"
  );

  // ── Header height (project-specific) ──────────────────────
  lines.push("  --header-height: 11rem;");

  lines.push("}");
  return lines.join("\n");
}

const css = "/* Generated from DESIGN.md — do not edit by hand */\n\n" + buildTheme(tokens) + "\n";

writeFileSync(outputPath, css, "utf8");
console.log("Wrote %d bytes to %s", css.length, outputPath);
