import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import Timer from "../../components/Timer/Timer.jsx";
import stil from "../../styles/screens.module.css";
import useStoredState from "../../hooks/useLocalStorage.js";
import { STORAGE_KEYS } from "../../lib/constants.js";
import { primeAudio, soundAlert } from "../../lib/alerts.js";
import { useEffect, useMemo, useRef, useState } from "react";

const TQ_SITES = [
  "Left arm",
  "Right arm",
  "Left leg",
  "Right leg",
  "Junctional / other",
];

// Prag je u sekundama: vjezba primjene poveza ima rok od jedne minute,
// kako stoji i na kartici M ("stopped within 1 minute").

// Prag je u sekundama: vjezba primjene poveza ima rok od jedne minute,
// kako stoji i na kartici M ("stopped within 1 minute").
const TQ_DEFAULTS = { tqAlertSeconds: 60 };

// Sat se racuna iz spremljenog trenutka primjene, ne iz brojanja otkucaja:
// zaslon zaspi, kartica se uspori u pozadini, stranica se ponovno ucita -
// proteklo vrijeme svejedno ostaje tocno.

// Sat se racuna iz spremljenog trenutka primjene, ne iz brojanja otkucaja:
// zaslon zaspi, kartica se uspori u pozadini, stranica se ponovno ucita -
// proteklo vrijeme svejedno ostaje tocno.
function tqElapsed(tq, now) {
  return Math.max(0, Math.floor((now - tq.startedAt) / 1000));
}

function wallClock(epoch) {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(epoch));
}

// Spremljeni oblik se mijenjao: prvo {startedAt, elapsedMs}, zatim popis
// poveza, sada jedan povez. Sve troje se cita, nista se ne rusi.

// Spremljeni oblik se mijenjao: prvo {startedAt, elapsedMs}, zatim popis
// poveza, sada jedan povez. Sve troje se cita, nista se ne rusi.
function readTourniquet(stored) {
  const candidate = Array.isArray(stored) ? stored[0] : stored;
  if (!candidate || !Number.isFinite(candidate.startedAt)) return null;
  return {
    startedAt: candidate.startedAt,
    limb: candidate.limb ?? "",
    note: candidate.note ?? "",
  };
}

export function TourniquetTimerScreen() {
  const [stored, setStored, storageError] = useStoredState(
    STORAGE_KEYS.TQ,
    null,
  );
  const [savedSettings] = useStoredState(STORAGE_KEYS.SETTINGS, TQ_DEFAULTS);
  const tourniquet = useMemo(() => readTourniquet(stored), [stored]);
  const settings = useMemo(
    () => ({ ...TQ_DEFAULTS, ...savedSettings }),
    [savedSettings],
  );

  const [site, setSite] = useState(TQ_SITES[0]);
  const [note, setNote] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const announced = useRef(false);

  useEffect(() => {
    if (!tourniquet) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [tourniquet]);

  const elapsed = tourniquet ? tqElapsed(tourniquet, now) : 0;
  const overdue = Boolean(tourniquet) && elapsed >= settings.tqAlertSeconds;

  // Oglasi se jednom po primjeni, ne svake sekunde.
  useEffect(() => {
    if (!overdue) return;
    if (announced.current) return;
    announced.current = true;
    soundAlert();
  }, [overdue]);

  function applyTourniquet(event) {
    event.preventDefault();
    primeAudio(); // zvuk se smije stvoriti samo na dodir korisnika
    announced.current = false;
    setNow(Date.now());
    setStored({ startedAt: Date.now(), limb: site, note: note.trim() });
    setNote("");
  }

  function removeTourniquet() {
    announced.current = false;
    setStored(null);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training timer"
        title="Tourniquet clock"
        description={`One tourniquet. The clock records when it went on and prompts at ${settings.tqAlertSeconds} seconds.`}
      />
      {storageError && <StorageWarning message={storageError} />}

      {tourniquet ? (
        <Panel title={tourniquet.limb || "Tourniquet"}>
          <Timer
            at={wallClock(tourniquet.startedAt)}
            label="Applied"
            note={
              overdue
                ? `Past ${settings.tqAlertSeconds} seconds. Bleeding should be stopped and the time recorded.`
                : `Prompt at ${settings.tqAlertSeconds} seconds.`
            }
            seconds={elapsed}
            state={overdue ? "alert" : "running"}
          />
          {tourniquet.note && <p className="small">{tourniquet.note}</p>}
          <div className={stil.buttonRow}>
            <button
              className={stil.criticalButton}
              onClick={removeTourniquet}
              type="button"
            >
              Remove TQ
            </button>
          </div>
        </Panel>
      ) : (
        <Panel title="Apply a tourniquet">
          <form className={stil.tqForm} onSubmit={applyTourniquet}>
            <label className={stil.field}>
              <span className={`caption ${stil.fieldLabel}`}>Site</span>
              <select
                className={stil.input}
                onChange={(event) => setSite(event.target.value)}
                value={site}
              >
                {TQ_SITES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className={stil.field}>
              <span className={`caption ${stil.fieldLabel}`}>
                Note (optional)
              </span>
              <input
                className={stil.input}
                onChange={(event) => setNote(event.target.value)}
                placeholder="CAT, high and tight"
                type="text"
                value={note}
              />
            </label>
            <button className={stil.startButton} type="submit">
              Start TQ
              <span className={stil.startHint}>Records the time now</span>
            </button>
          </form>
        </Panel>
      )}

      <p className={stil.safetyNotice}>
        Training aid only. The prompt above is a drill cue, not medical advice;
        follow your course protocol and use an approved method for real care.
      </p>
    </div>
  );
}
