import Panel from "../../components/Panel/Panel.jsx";
import ProgressBar from "../../components/ProgressBar/ProgressBar.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import stil from "../../styles/screens.module.css";
import useStoredState from "../../hooks/useLocalStorage.js";
import { Link } from "react-router-dom";
import { RouteNames, STORAGE_KEYS } from "../../lib/constants.js";
import { formatStamp } from "../../lib/formatTime.js";
import { percentOf, toneForPercent } from "../../lib/scoring.js";
import { useState } from "react";

// Prosjek preskace zapise bez bodova: stariji scenariji su biljezili samo
// broj pogresaka, pa bi ih racunanje kao nulu lazno srusilo.
function averagePercent(runs) {
  const scored = runs.filter(
    (run) =>
      Number.isFinite(run.score) && Number.isFinite(run.total) && run.total > 0,
  );
  if (scored.length === 0) return null;
  const sum = scored.reduce((total, run) => total + run.score / run.total, 0);
  return Math.round((sum / scored.length) * 100);
}

function RunRow({ title, at, score, total, note }) {
  const scored = Number.isFinite(score) && Number.isFinite(total) && total > 0;
  const percent = scored ? percentOf(score, total) : null;

  return (
    <li className={stil.runRow}>
      <div className={stil.runHead}>
        <strong>{title}</strong>
        {at && <span className={`small ${stil.muted}`}>{formatStamp(at)}</span>}
      </div>
      {scored ? (
        <ProgressBar
          label={`${score} of ${total}`}
          max={total}
          tone={toneForPercent(percent)}
          value={score}
        />
      ) : (
        <p className={`small ${stil.muted}`}>Saved before scoring was added.</p>
      )}
      {note && <p className={`small ${stil.muted}`}>{note}</p>}
    </li>
  );
}

export function ProgressScreen() {
  const [quizRuns, setQuizRuns, quizError] = useStoredState(
    STORAGE_KEYS.QUIZ_RUNS,
    [],
  );
  const [scenarioRuns, setScenarioRuns, scenarioError] = useStoredState(
    STORAGE_KEYS.SCENARIO_RUNS,
    [],
  );
  const [confirmClear, setConfirmClear] = useState(false);

  const quizAverage = averagePercent(quizRuns);
  const scenarioAverage = averagePercent(scenarioRuns);
  const nothingSaved = quizRuns.length === 0 && scenarioRuns.length === 0;

  function clearHistory() {
    setQuizRuns([]);
    setScenarioRuns([]);
    setConfirmClear(false);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Local to this browser"
        title="Progress"
        description="Practice history is saved on this device only. Nothing is uploaded."
      />
      {(quizError || scenarioError) && (
        <StorageWarning message={quizError || scenarioError} />
      )}

      <div className={stil.statGrid}>
        <Panel title="Quiz attempts">
          <p className={stil.statNumber}>{quizRuns.length}</p>
          <p className="small">
            {quizAverage === null ? "No score yet" : `${quizAverage}% average`}
          </p>
        </Panel>
        <Panel title="Scenario runs">
          <p className={stil.statNumber}>{scenarioRuns.length}</p>
          <p className="small">
            {scenarioAverage === null
              ? "No score yet"
              : `${scenarioAverage}% average`}
          </p>
        </Panel>
      </div>

      <Panel title="Quiz attempts">
        {quizRuns.length === 0 ? (
          <p className="small">
            Finish a quiz and the score appears here.{" "}
            <Link to={RouteNames.QUIZ}>Start one</Link>.
          </p>
        ) : (
          <ul className={stil.runList}>
            {quizRuns.slice(0, 10).map((run, index) => (
              <RunRow
                at={run.at}
                key={run.id}
                note={
                  Array.isArray(run.wrong) && run.wrong.length > 0
                    ? `${run.wrong.length} to go over`
                    : null
                }
                score={run.score}
                title={`Attempt ${quizRuns.length - index}`}
                total={run.total}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Scenario runs">
        {scenarioRuns.length === 0 ? (
          <p className="small">
            Work through a scenario and the score appears here.{" "}
            <Link to={RouteNames.SCENARIO}>Choose one</Link>.
          </p>
        ) : (
          <ul className={stil.runList}>
            {scenarioRuns.slice(0, 10).map((run) => (
              <RunRow
                at={run.at}
                key={run.id}
                note={
                  Number.isFinite(run.mistakes)
                    ? `${run.mistakes} ${run.mistakes === 1 ? "action" : "actions"} that did not belong`
                    : null
                }
                score={run.score}
                title={run.title}
                total={run.total}
              />
            ))}
          </ul>
        )}
      </Panel>

      {/* Brisanje stoji odvojeno, s razmakom iznad, i trazi drugu potvrdu. */}
      {!nothingSaved && (
        <div className={stil.destructive}>
          {confirmClear ? (
            <>
              <p className="small">
                This deletes every saved quiz and scenario score on this device.
                It cannot be undone.
              </p>
              <div className={stil.buttonRow}>
                <button
                  className={stil.criticalButton}
                  onClick={clearHistory}
                  type="button"
                >
                  Delete all history
                </button>
                <button
                  className={stil.secondaryButton}
                  onClick={() => setConfirmClear(false)}
                  type="button"
                >
                  Keep it
                </button>
              </div>
            </>
          ) : (
            <button
              className={stil.secondaryButton}
              onClick={() => setConfirmClear(true)}
              type="button"
            >
              Clear history
            </button>
          )}
        </div>
      )}
    </div>
  );
}
