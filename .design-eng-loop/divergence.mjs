// design-eng-loop divergence — FROZEN SCOPE (established R6, 2026-07-12).
// Method: css-hex-only, fallback-aware, excl tests + palettes.ts + atlasData.ts,
// over packages/renderer/src + apps/web/src. divergence = 0.7*offToken + 0.3*min(gaps/5,1).
// R6 baseline: offToken 0.534, gaps 5, divergence 0.674 (NOT comparable to R1 0.206 — unsaved scope).
import { execSync } from "child_process";
import fs from "fs";
const gaps = Number(process.argv[2] ?? 5);
const files = execSync("find packages/renderer/src apps/web/src -name '*.ts' -o -name '*.tsx' -o -name '*.css'", {encoding:"utf8"})
  .split("\n").filter(Boolean)
  .filter(f => !/test|__tests__|\.spec\./.test(f))
  .filter(f => !/palettes\.ts|atlasData\.ts/.test(f));
let hex = 0, vars = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const noFb = src.replace(/var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}\)/g, "var(--x)");
  hex += (noFb.match(/#[0-9a-fA-F]{6}\b/g) || []).length;
  vars += (src.match(/var\(--[\w-]+/g) || []).length;
}
const offToken = hex / (hex + vars);
console.log(JSON.stringify({files: files.length, hex, vars, offToken: +offToken.toFixed(3), gaps, divergence: +(0.7*offToken + 0.3*Math.min(gaps/5,1)).toFixed(3)}));
