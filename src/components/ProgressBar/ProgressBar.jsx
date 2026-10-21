// Traka polozaja ili rezultata. Nije pokazivac ucitavanja - u ovoj
// aplikaciji se nista ne ceka s mreze, pa nema neodredjenog stanja.

import stil from "./ProgressBar.module.css";

export default function ProgressBar({
  value,
  max,
  label,
  showCount = false,
  tone = "accent",
  ariaLabel,
}) {
  const gornja = max > 0 ? max : 1;
  const stvarna = Math.min(Math.max(value || 0, 0), gornja);
  const postotak = Math.round((stvarna / gornja) * 100);

  return (
    <div className={stil.traka}>
      {(label || showCount) && (
        <div className={stil.zaglavlje}>
          {label && <span className={stil.oznaka}>{label}</span>}
          {showCount && (
            <span className={stil.brojac}>
              {stvarna} / {gornja}
            </span>
          )}
        </div>
      )}
      <div
        aria-label={label || ariaLabel || "Progress"}
        aria-valuemax={gornja}
        aria-valuemin={0}
        aria-valuenow={stvarna}
        className={`${stil.staza} ${stil[tone]}`}
        role="progressbar"
      >
        <div className={stil.ispuna} style={{ width: `${postotak}%` }} />
      </div>
    </div>
  );
}
