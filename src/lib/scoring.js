// Pravila bodovanja na jednom mjestu, da kviz i scenarij sude jednako.

// FNV-1a: isti niz uvijek daje isti broj, a slicni nizovi vrlo razlicite.
// Sluzi za stalan, ali izmijesan redoslijed ponudjenih postupaka.
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export const FULL = 1;
export const HALF = 0.5;
export const NONE = 0;

// Prag prolaza. Zivi ovdje, ne u komponenti, pa ga se mijenja na jednom mjestu.
export function toneForPercent(percent) {
  if (percent >= 80) return "ok";
  if (percent >= 50) return "warn";
  return "critical";
}

export function percentOf(score, total) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

// Scenarij: postupak odabran na svom mjestu nosi puni bod, tocan postupak u
// krivom trenutku pola, a distraktor nista. Redoslijed je ono sto se uci, pa
// se "dobro, ali prerano" mora razlikovati od "pogresno".
export function scenarioPick(option, expectedIndex, steps) {
  const stepIndex = steps.findIndex((step) => step.id === option.id);

  if (stepIndex === -1) {
    return { kind: "distractor", points: NONE, advances: false };
  }
  if (stepIndex === expectedIndex) {
    return { kind: "correct", points: FULL, advances: true };
  }
  return {
    kind: "outOfOrder",
    points: HALF,
    advances: true,
    belongsAt: stepIndex,
  };
}
