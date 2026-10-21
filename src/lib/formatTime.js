// Sekunde u mm:ss, a preko sata u hh:mm:ss. Uvijek s vodecom nulom.

function dvije(n) {
  return (n < 10 ? "0" : "") + n;
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const sati = Math.floor(s / 3600);
  const minute = Math.floor((s % 3600) / 60);
  const sekunde = s % 60;

  if (sati > 0) return `${sati}:${dvije(minute)}:${dvije(sekunde)}`;
  return `${dvije(minute)}:${dvije(sekunde)}`;
}
