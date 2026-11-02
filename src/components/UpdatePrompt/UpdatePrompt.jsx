// Ponuda za osvjezavanje aplikacije kad je spreman novi servisni radnik.
//
// Nikad se ne osvjezava samo od sebe. Ako netko mjeri vrijeme poveza, ponuda
// ceka: ponovno ucitavanje usred vjezbe je gore od stare verzije. Sat bi i
// prezivio (racuna se iz spremljenog trenutka), ali zaslon koji se sam
// ponovno ucita dok se gleda u njega nije prihvatljiv.

import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { STORAGE_KEYS } from "../../lib/constants.js";
import stil from "./UpdatePrompt.module.css";

function tourniquetRunning() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.TQ);
    if (!raw) return false;
    const stored = JSON.parse(raw);
    const one = Array.isArray(stored) ? stored[0] : stored;
    return Boolean(one && Number.isFinite(one.startedAt));
  } catch {
    return false;
  }
}

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [busy, setBusy] = useState(tourniquetRunning());

  // Dok sat radi, ponuda se ne prikazuje; provjerava se povremeno.
  useEffect(() => {
    if (!needRefresh) return undefined;
    const interval = window.setInterval(() => setBusy(tourniquetRunning()), 5000);
    return () => window.clearInterval(interval);
  }, [needRefresh]);

  if (!needRefresh || busy) return null;

  return (
    <div aria-live="polite" className={stil.ponuda} role="status">
      <p className={stil.tekst}>A new version is ready.</p>
      <div className={stil.gumbi}>
        <button
          className={stil.osvjezi}
          onClick={() => updateServiceWorker(true)}
          type="button"
        >
          Reload
        </button>
        <button
          className={stil.kasnije}
          onClick={() => setNeedRefresh(false)}
          type="button"
        >
          Later
        </button>
      </div>
    </div>
  );
}
