// Zvuk i vibracija za upozorenja na povez.
//
// Upozorenje je uvijek zvuk + tekst + boja, nikad samo boja. Tekst i boja su
// u komponenti; ovdje su ostala dva, i oba smiju tiho zakazati: preglednik
// moze blokirati zvuk, a stolno racunalo nema vibraciju. Nijedna greska
// odavde ne smije srusiti zaslon.

let audio = null;

// Zvuk se smije stvoriti tek nakon dodira korisnika, pa se poziva na START.
export function primeAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audio) audio = new Ctx();
    if (audio.state === "suspended") audio.resume();
  } catch {
    audio = null;
  }
}

function beep() {
  try {
    if (!audio || audio.state !== "running") return;
    const oscilator = audio.createOscillator();
    const pojacalo = audio.createGain();
    oscilator.type = "square";
    oscilator.frequency.value = 880;
    pojacalo.gain.value = 0.05;
    oscilator.connect(pojacalo).connect(audio.destination);
    oscilator.start();
    oscilator.stop(audio.currentTime + 0.18);
  } catch {
    // tiho: zvuk nije nuzan
  }
}

function vibrate() {
  try {
    navigator.vibrate?.([120, 80, 120]);
  } catch {
    // tiho: vecina stolnih uredjaja nema vibraciju
  }
}

export function soundAlert() {
  beep();
  vibrate();
}
