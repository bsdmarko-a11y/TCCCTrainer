// Generira src/styles/variables.css iz design/tokens.json.
// Pokreni s: npm run tokens
//
// Tokeni su jedini izvor istine za boje, tipografiju, razmake i radijuse.
// variables.css se NE uredjuje rucno - svaka promjena ide u design/tokens.json
// pa se ovo ponovno pokrene.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const korijen = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokeni = JSON.parse(readFileSync(resolve(korijen, "design/tokens.json"), "utf8"));

const teme = tokeni.color.themes.map((t) => t.id);
const prvaTema = teme[0];

// Boja i sjena mogu imati vrijednost po temi. Obicni string znaci: isto u svim temama.
function vrijednost(token, tema) {
  if (typeof token.value === "string") return token.value;
  return token.value[tema] ?? token.value[prvaTema];
}

function blokTeme(tema) {
  const redovi = [];
  for (const t of tokeni.color.tokens) redovi.push(`  --${t.name}: ${vrijednost(t, tema)};`);
  for (const t of tokeni.shadow?.tokens ?? []) redovi.push(`  --${t.name}: ${vrijednost(t, tema)};`);
  return redovi.join("\n");
}

let css = `/* GENERIRANO iz design/tokens.json - ne uredjuj rucno. */\n`;
css += `/* ${tokeni.name}, verzija tokena ${tokeni.version} */\n\n`;

// Prva tema je ujedno i zadana, pa ide i na :root.
css += `:root,\n[data-theme="${prvaTema}"] {\n${blokTeme(prvaTema)}\n}\n`;
for (const tema of teme.slice(1)) {
  css += `\n[data-theme="${tema}"] {\n${blokTeme(tema)}\n}\n`;
}

// Razmaci, radijusi i velicine su jednaki u svim temama.
const bezTeme = [];
for (const obitelj of ["spacing", "radius", "size"]) {
  for (const t of tokeni[obitelj]?.tokens ?? []) bezTeme.push(`  --${t.name}: ${t.value};`);
}
for (const [kljuc, stog] of Object.entries(tokeni.type.families)) {
  bezTeme.push(`  --font-${kljuc}: ${stog};`);
}
css += `\n:root {\n${bezTeme.join("\n")}\n}\n`;

// Svaki tipografski stil postaje klasa: .body, .caption, .clock-xl ...
for (const grupa of tokeni.type.groups) {
  css += `\n/* ${grupa.name} */\n`;
  for (const stil of grupa.styles) {
    const redovi = [
      `  font-family: var(--font-${stil.family ?? grupa.family});`,
      `  font-size: ${stil.fontSize};`,
      `  line-height: ${stil.lineHeight};`,
      `  font-weight: ${stil.fontWeight};`,
    ];
    if (stil.letterSpacing) redovi.push(`  letter-spacing: ${stil.letterSpacing};`);
    css += `.${stil.name} {\n${redovi.join("\n")}\n}\n`;
  }
}

writeFileSync(resolve(korijen, "src/styles/variables.css"), css);

const brojBoja = tokeni.color.tokens.length;
const brojStilova = tokeni.type.groups.reduce((n, g) => n + g.styles.length, 0);
console.log(`variables.css: ${brojBoja} boja x ${teme.length} teme, ${brojStilova} tipografskih stilova`);
