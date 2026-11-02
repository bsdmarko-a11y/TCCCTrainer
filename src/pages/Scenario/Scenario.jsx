import Panel from "../../components/Panel/Panel.jsx";
import ProgressBar from "../../components/ProgressBar/ProgressBar.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import scenarios from "../../data/scenarios.json";
import stil from "../../styles/screens.module.css";
import useStoredState from "../../hooks/useLocalStorage.js";
import { Link, Navigate, useParams } from "react-router-dom";
import { RouteNames, STORAGE_KEYS } from "../../lib/constants.js";
import {
  hashString,
  percentOf,
  scenarioPick,
  toneForPercent,
} from "../../lib/scoring.js";
import { useMemo, useRef, useState } from "react";

export function ScenarioListScreen() {
  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Decision practice"
        title="Scenarios"
        description="Choose the next appropriate action. Incorrect choices explain why they do not fit the situation."
      />
      <div className={stil.stepList}>
        {scenarios.scenarios.map((scenario, index) => (
          <Link
            className={stil.scenarioLink}
            key={scenario.id}
            to={RouteNames.SCENARIO_RUN.replace(":scenarioId", scenario.id)}
          >
            <span className={stil.scenarioNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={stil.stepText}>
              <strong>{scenario.title}</strong>
              <span className="small">{scenario.brief}</span>
            </span>
            <span aria-hidden="true" className={stil.modeArrow}>
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ScenarioRunScreen() {
  const { scenarioId } = useParams();
  const scenario = scenarios.scenarios.find((item) => item.id === scenarioId);
  const [, setRuns, storageError] = useStoredState(
    STORAGE_KEYS.SCENARIO_RUNS,
    [],
  );
  const [picks, setPicks] = useState([]);
  const saved = useRef(false);

  // Sve mogucnosti stoje na stolu od pocetka. Kad bi se popis kratio kako
  // koraci prolaze, zadnji bi se sam odao.
  const options = useMemo(() => {
    if (!scenario) return [];
    const all = [...scenario.steps, ...scenario.distractors];
    // Stalan, ali ne i izvorni redoslijed: isti scenarij izgleda isto svaki
    // put, a tocni koraci nisu na vrhu popisa. Kljuc je rasprseni niz, ne
    // umnozak indeksa: umnozak se urusi kad broj mogucnosti podijeli korak.
    return all
      .map((option) => ({ option, key: hashString(scenario.id + option.id) }))
      .sort((a, b) => a.key - b.key)
      .map((entry) => entry.option);
  }, [scenario]);

  if (!scenario) return <Navigate replace to={RouteNames.SCENARIO} />;

  const chosenIds = new Set(picks.map((pick) => pick.id));
  const taken = picks.filter((pick) => pick.advances).length;
  const done = taken >= scenario.steps.length;
  const score = picks.reduce((total, pick) => total + pick.points, 0);
  const percent = percentOf(score, scenario.steps.length);
  const last = picks[picks.length - 1];

  function choose(option) {
    if (done || chosenIds.has(option.id)) return;

    const expectedIndex = picks.filter((pick) => pick.advances).length;
    const result = scenarioPick(option, expectedIndex, scenario.steps);
    const pick = {
      id: option.id,
      label: option.label,
      why: option.why,
      ...result,
    };
    const next = [...picks, pick];
    setPicks(next);

    const takenNow = next.filter((item) => item.advances).length;
    if (takenNow < scenario.steps.length || saved.current) return;

    saved.current = true;
    const finalScore = next.reduce((total, item) => total + item.points, 0);
    setRuns((savedRuns) => [
      {
        id: `${scenario.id}-${Date.now()}`,
        at: new Date().toISOString(),
        scenarioId: scenario.id,
        title: scenario.title,
        score: finalScore,
        total: scenario.steps.length,
        mistakes: next.filter((item) => item.kind === "distractor").length,
        picks: next.map((item) => ({ id: item.id, kind: item.kind })),
      },
      ...savedRuns,
    ]);
  }

  function restart() {
    saved.current = false;
    setPicks([]);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow={done ? "Scenario complete" : "Scenario"}
        title={scenario.title}
      />
      {storageError && <StorageWarning message={storageError} />}

      <Panel title="Situation">
        <p>{scenario.brief}</p>
      </Panel>

      <ProgressBar
        label={done ? "Score" : "Actions taken"}
        max={scenario.steps.length}
        showCount
        tone={done ? toneForPercent(percent) : "accent"}
        value={done ? score : taken}
      />

      {!done && (
        <Panel title={`What do you do ${taken === 0 ? "first" : "next"}?`}>
          <div className={stil.optionList}>
            {options.map((option) => (
              <button
                className={stil.option}
                disabled={chosenIds.has(option.id)}
                key={option.id}
                onClick={() => choose(option)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          {last && (
            <div className={stil[feedbackClass(last.kind)]}>
              <strong>{feedbackTitle(last.kind)}</strong>
              <p className="small">{last.why}</p>
            </div>
          )}
        </Panel>
      )}

      {done && (
        <>
          <Panel title="How it went">
            <p className="small">
              {score} of {scenario.steps.length} points. Half a point for the
              right action at the wrong time, none for an action that did not
              belong.
            </p>
          </Panel>
          <Panel title="Your order against the correct order">
            <ol className={stil.compareList}>
              {scenario.steps.map((step, index) => {
                const pick = picks.filter((item) => item.advances)[index];
                return (
                  <li className={stil.compareRow} key={step.id}>
                    <span className={stil.listNumber}>{index + 1}</span>
                    <span className={stil.stepText}>
                      <strong>{step.label}</strong>
                      {pick && pick.id !== step.id && (
                        <span className={`small ${stil.reviewWrong}`}>
                          You chose: {pick.label}
                        </span>
                      )}
                      {pick && pick.id === step.id && (
                        <span className={`small ${stil.reviewRight}`}>
                          You chose this here.
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
            {picks.some((pick) => pick.kind === "distractor") && (
              <>
                <p className={`caption ${stil.fieldLabel}`}>
                  Actions that did not belong
                </p>
                <ul className={stil.contentList}>
                  {picks
                    .filter((pick) => pick.kind === "distractor")
                    .map((pick) => (
                      <li key={pick.id}>
                        <span className={stil.mistakeMark} aria-hidden="true">
                          !
                        </span>
                        <span>
                          <strong>{pick.label}</strong>
                          <span className="small"> {pick.why}</span>
                        </span>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </Panel>
          <div className={stil.buttonRow}>
            <button className={stil.button} onClick={restart} type="button">
              Run it again
            </button>
            <Link className={stil.secondaryButton} to={RouteNames.SCENARIO}>
              Choose another
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function feedbackClass(kind) {
  if (kind === "correct") return "feedbackGood";
  if (kind === "outOfOrder") return "feedbackWarn";
  return "feedbackBad";
}

function feedbackTitle(kind) {
  if (kind === "correct") return "Correct, and in the right order";
  if (kind === "outOfOrder") return "Right action, wrong time";
  return "That action did not belong here";
}
