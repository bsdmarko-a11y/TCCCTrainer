// Sat: uvijek mono, uvijek s dvotockom, nikad goli broj.
// Komponenta samo prikazuje sekunde koje dobije - ne broji sama.

import { formatTime } from "../../lib/formatTime.js";
import stil from "./Timer.module.css";

export default function Timer({
  seconds,
  label,
  at,
  note,
  state = "running",
  size = "lg",
  live = true,
}) {
  const tekst = formatTime(seconds);

  return (
    <div className={`${stil.sat} ${stil[size]} ${stil[state]}`}>
      {(label || at) && (
        <div className={stil.zaglavlje}>
          {label && <p className={stil.oznaka}>{label}</p>}
          {at && <p className={stil.vrijeme}>{at}</p>}
        </div>
      )}
      <p
        aria-label={label ? `${label}: ${tekst}` : tekst}
        aria-live={live ? "polite" : "off"}
        className={stil.brojke}
        role="timer"
      >
        {tekst}
      </p>
      {note && <p className={stil.biljeska}>{note}</p>}
    </div>
  );
}
