import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import BottomNav from "./components/BottomNav/BottomNav.jsx";
import ProgressBar from "./components/ProgressBar/ProgressBar.jsx";
import ScreenHeader from "./components/ScreenHeader/ScreenHeader.jsx";
import Timer from "./components/Timer/Timer.jsx";
import casualtyCard from "./data/casualty-card.json";
import march from "./data/march.json";
import questions from "./data/questions.json";
import scenarios from "./data/scenarios.json";
import useSwipe, { useArrowKeys } from "./hooks/useSwipe.js";
import { primeAudio, soundAlert } from "./lib/alerts.js";
import { RouteNames, STORAGE_KEYS, THEMES } from "./lib/constants.js";
import {
  hashString,
  percentOf,
  scenarioPick,
  toneForPercent,
} from "./lib/scoring.js";
import stil from "./App.module.css";

const STORAGE_ERROR =
  "Saved data could not be accessed. Your changes may not persist in this browser.";

function useStoredState(key, initialValue) {
  const [initial] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return {
        value: saved === null ? initialValue : JSON.parse(saved),
        error: "",
      };
    } catch (error) {
      console.error(`Could not read ${key} from local storage.`, error);
      return { value: initialValue, error: STORAGE_ERROR };
    }
  });

  const [value, setValue] = useState(initial.value);
  const valueRef = useRef(value);
  const [error, setError] = useState(initial.error);

  function updateValue(nextValue) {
    const next =
      typeof nextValue === "function" ? nextValue(valueRef.current) : nextValue;
    valueRef.current = next;
    setValue(next);

    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      setError("");
    } catch (storageError) {
      console.error(`Could not save ${key} to local storage.`, storageError);
      setError(STORAGE_ERROR);
    }
  }

  return [value, updateValue, error];
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [theme, setTheme, themeError] = useStoredState(
    STORAGE_KEYS.THEME,
    THEMES.DARK,
  );
  const location = useLocation();
  const activeTheme = Object.values(THEMES).includes(theme)
    ? theme
    : THEMES.DARK;
  // Traka se skriva samo na ispisu kartice, nigdje drugdje.
  const isPrintRoute = location.pathname.endsWith("/ispis");

  // Ispis kartice je uvijek u print temi, bez obzira na odabranu: ono sto se
  // vidi na zaslonu je onda ono sto izlazi na papir.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isPrintRoute ? THEMES.PRINT : activeTheme,
    );
  }, [activeTheme, isPrintRoute]);

  return (
    <div className={stil.app}>
      {/* Ispis je dokument: bez zaglavlja aplikacije i bez navigacije. */}
      {!isPrintRoute && (
        <header className={stil.topBar}>
          <Link className={stil.wordmark} to={RouteNames.HOME}>
            TCCC <span>TRAINER</span>
          </Link>
          <label className={stil.themePicker}>
            <span className="samo-citac">Color theme</span>
            <select
              aria-label="Color theme"
              value={activeTheme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value={THEMES.DARK}>Dark</option>
              <option value={THEMES.NIGHT}>Night</option>
              <option value={THEMES.PRINT}>Print</option>
            </select>
          </label>
        </header>
      )}

      <main
        className={isPrintRoute ? `${stil.main} ${stil.mainIspis}` : stil.main}
      >
        {themeError && <StorageWarning message={themeError} />}
        <Routes>
          <Route path={RouteNames.HOME} element={<HomeScreen />} />
          <Route path={RouteNames.MARCH} element={<MarchScreen />} />
          <Route path={RouteNames.MARCH_STEP} element={<MarchScreen />} />
          <Route path={RouteNames.QUIZ} element={<QuizScreen />} />
          <Route path={RouteNames.QUIZ_REVIEW} element={<QuizReviewScreen />} />
          <Route path={RouteNames.SCENARIO} element={<ScenarioListScreen />} />
          <Route
            path={RouteNames.SCENARIO_RUN}
            element={<ScenarioRunScreen key={location.pathname} />}
          />
          <Route path={RouteNames.TQ} element={<TourniquetTimerScreen />} />
          <Route path={RouteNames.CARD} element={<CardListScreen />} />
          <Route
            path={RouteNames.CARD_NEW}
            element={<CardEditorScreen key={location.pathname} />}
          />
          <Route path={RouteNames.CARD_PRINT} element={<CardPrintScreen />} />
          <Route
            path={RouteNames.CARD_ONE}
            element={<CardEditorScreen key={location.pathname} />}
          />
          <Route path={RouteNames.PROGRESS} element={<ProgressScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </main>

      {!isPrintRoute && <BottomNav />}
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section className={`${stil.panel} ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </section>
  );
}

function StorageWarning({ message }) {
  return (
    <p className={stil.warning} role="status">
      {message}
    </p>
  );
}

function HomeScreen() {
  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training only"
        title="TCCC Trainer"
        description="Practice the sequence, review your knowledge, and keep training records for the lane."
      />
      <p className={stil.safetyNotice}>
        Training aid only—not for use on a real casualty. Use no real names or
        patient details in training records.
      </p>

      <div className={stil.modeGrid}>
        <ModeLink
          description={`${march.steps.length} MARCH-PAWS topics`}
          title="Field guide"
          to={RouteNames.MARCH}
        />
        <ModeLink
          description={`${questions.questions.length} practice questions`}
          title="Knowledge quiz"
          to={RouteNames.QUIZ}
        />
        <ModeLink
          description={`${scenarios.scenarios.length} decision exercises`}
          title="Scenarios"
          to={RouteNames.SCENARIO}
        />
        <ModeLink
          description="Track elapsed time for a training tourniquet"
          title="Tourniquet timer"
          to={RouteNames.TQ}
        />
        <ModeLink
          description={`${casualtyCard.fields.length} training-card fields`}
          title="Casualty card"
          to={RouteNames.CARD}
        />
        <ModeLink
          description="Review locally saved practice results"
          title="Progress"
          to={RouteNames.PROGRESS}
        />
      </div>

      <Panel title="About this content">
        <p className="small">
          Content reference: {march.guidelineVersion}. Practice scenarios and
          quiz answers are educational material and do not replace instruction
          from a qualified course.
        </p>
      </Panel>
    </div>
  );
}

function ModeLink({ title, description, to }) {
  return (
    <Link className={stil.modeCard} to={to}>
      <span className="mode-label">{title}</span>
      <span className={`small ${stil.muted}`}>{description}</span>
      <span aria-hidden="true" className={stil.modeArrow}>
        →
      </span>
    </Link>
  );
}

function MarchScreen() {
  const { stepId } = useParams();
  const stepIndex = march.steps.findIndex((step) => step.id === stepId);
  const step = march.steps[stepIndex];

  if (stepId && !step) return <Navigate replace to={RouteNames.MARCH} />;

  if (!step) {
    return (
      <div className={stil.screen}>
        <ScreenHeader
          eyebrow="Field guide"
          title="MARCH-PAWS"
          description={`Reference: ${march.guidelineVersion}`}
        />
        <div className={stil.stepList}>
          {march.steps.map((item, index) => (
            <Link
              className={stil.stepLink}
              key={item.id}
              to={RouteNames.MARCH_STEP.replace(":stepId", item.id)}
            >
              <span
                className={
                  item.id === "m"
                    ? `${stil.stepBadge} ${stil.stepBadgeCritical}`
                    : stil.stepBadge
                }
              >
                {item.letter}
              </span>
              <span className={stil.stepText}>
                <strong>{item.title}</strong>
                <span className="small">{item.note}</span>
              </span>
              <span className={stil.muted}>
                {index + 1}/{march.steps.length}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return <MarchStep index={stepIndex} key={step.id} step={step} />;
}

function MarchStep({ step, index }) {
  const navigate = useNavigate();
  const kartica = useRef(null);
  const previous = march.steps[index - 1];
  const next = march.steps[index + 1];

  const naKorak = useCallback(
    (cilj) => {
      if (cilj) navigate(RouteNames.MARCH_STEP.replace(":stepId", cilj.id));
    },
    [navigate],
  );

  const naLijevo = useCallback(() => naKorak(next), [naKorak, next]);
  const naDesno = useCallback(() => naKorak(previous), [naKorak, previous]);

  useSwipe(kartica, { onLeft: naLijevo, onRight: naDesno });
  useArrowKeys({ onLeft: naDesno, onRight: naLijevo });

  return (
    <div className={stil.screen} ref={kartica}>
      <ScreenHeader
        eyebrow={`${step.phase} • Step ${index + 1} of ${march.steps.length}`}
        title={`${step.letter} — ${step.title}`}
        description={step.note}
      />
      <ol aria-hidden="true" className={stil.stepDots}>
        {march.steps.map((item, dot) => (
          <li
            className={dot === index ? stil.dotActive : stil.dot}
            key={item.id}
          />
        ))}
      </ol>
      <Panel title="Actions">
        <ol className={stil.contentList}>
          {step.actions.map((action, index) => (
            <li key={action}>
              <span className={stil.listNumber}>{index + 1}</span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel title="Common mistakes">
        <ul className={stil.contentList}>
          {step.mistakes.map((mistake) => (
            <li key={mistake}>
              <span className={stil.mistakeMark} aria-hidden="true">
                !
              </span>
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className={stil.pager}>
        {previous ? (
          <Link
            className={stil.secondaryButton}
            to={RouteNames.MARCH_STEP.replace(":stepId", previous.id)}
          >
            Previous
          </Link>
        ) : (
          <Link className={stil.secondaryButton} to={RouteNames.MARCH}>
            All topics
          </Link>
        )}
        {next ? (
          <Link
            className={stil.button}
            to={RouteNames.MARCH_STEP.replace(":stepId", next.id)}
          >
            Next topic
          </Link>
        ) : (
          <Link className={stil.button} to={RouteNames.MARCH}>
            Back to all topics
          </Link>
        )}
      </div>
      <p className={`caption ${stil.swipeHint}`}>
        Swipe or use the arrow keys to move between topics.
      </p>
    </div>
  );
}

function QuizScreen() {
  const navigate = useNavigate();
  const [, setRuns, storageError] = useStoredState(STORAGE_KEYS.QUIZ_RUNS, []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState({
    questionId: questions.questions[0].id,
    value: null,
  });
  const [timer, setTimer] = useState({
    questionId: questions.questions[0].id,
    seconds: questions.questions[0].seconds,
  });
  const completed = useRef(false);
  // Svaki odgovor se pamti, da pregled na kraju moze pokazati sto je promaseno.
  const given = useRef([]);
  const question = questions.questions[index];
  const selected = answer.questionId === question.id ? answer.value : null;
  const remaining =
    timer.questionId === question.id ? timer.seconds : question.seconds;
  const timedOut = remaining <= 0 && selected === null;
  const hasAnswered = selected !== null || timedOut;
  const finalAnswer = timedOut ? -1 : selected;

  useEffect(() => {
    if (hasAnswered) return undefined;

    const timeout = window.setTimeout(
      () =>
        setTimer((current) => {
          const seconds =
            current.questionId === question.id
              ? current.seconds
              : question.seconds;
          return {
            questionId: question.id,
            seconds: Math.max(0, seconds - 1),
          };
        }),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [hasAnswered, question.id, question.seconds, remaining]);

  function finishQuiz(finalScore) {
    if (completed.current) return;
    completed.current = true;
    const run = {
      id: Date.now().toString(),
      at: new Date().toISOString(),
      score: finalScore,
      total: questions.questions.length,
      // picked je -1 kad je vrijeme isteklo.
      wrong: given.current.filter((a) => a.picked !== a.correct),
    };
    setRuns((savedRuns) => [run, ...savedRuns]);
    navigate(RouteNames.QUIZ_REVIEW);
  }

  function advance() {
    given.current = [
      ...given.current.filter((a) => a.questionId !== question.id),
      {
        questionId: question.id,
        picked: finalAnswer,
        correct: question.correct,
      },
    ];

    const updatedScore = score + (finalAnswer === question.correct ? 1 : 0);
    if (index === questions.questions.length - 1) {
      finishQuiz(updatedScore);
      return;
    }
    if (finalAnswer === question.correct) setScore(updatedScore);
    setIndex((current) => current + 1);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow={`Question ${index + 1} of ${questions.questions.length}`}
        title="Knowledge quiz"
      />
      {storageError && <StorageWarning message={storageError} />}
      <ProgressBar
        label="Question"
        max={questions.questions.length}
        showCount
        value={index + 1}
      />
      <Timer
        label="Time remaining"
        note={
          hasAnswered
            ? "Read the feedback, then continue."
            : remaining <= 10
              ? "Under ten seconds."
              : null
        }
        seconds={remaining}
        size="sm"
        state={hasAnswered ? "stopped" : remaining <= 10 ? "warn" : "running"}
      />
      <Panel title={question.question}>
        <div className={stil.optionList}>
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            const isCorrect = optionIndex === question.correct;
            let optionClass = stil.option;
            if (hasAnswered && isCorrect) {
              optionClass += ` ${stil.optionCorrect}`;
            } else if (isSelected) {
              optionClass += ` ${stil.optionWrong}`;
            }

            return (
              <button
                aria-pressed={isSelected}
                className={optionClass}
                disabled={hasAnswered}
                key={option}
                onClick={() =>
                  setAnswer({ questionId: question.id, value: optionIndex })
                }
                type="button"
              >
                <span className={stil.optionLetter}>
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        {hasAnswered && (
          <div
            className={
              finalAnswer === question.correct
                ? stil.feedbackGood
                : stil.feedbackBad
            }
          >
            <strong>
              {timedOut
                ? "Time expired"
                : finalAnswer === question.correct
                  ? "Correct"
                  : "Not quite"}
            </strong>
            <p className="small">{question.why}</p>
          </div>
        )}
        {hasAnswered && (
          <button className={stil.button} onClick={advance} type="button">
            {index === questions.questions.length - 1
              ? "Finish quiz"
              : "Next question"}
          </button>
        )}
      </Panel>
      <p className={`caption ${stil.muted}`}>{questions.guidelineVersion}</p>
    </div>
  );
}

function QuizReviewScreen() {
  const [runs, , storageError] = useStoredState(STORAGE_KEYS.QUIZ_RUNS, []);
  const latest = runs[0];
  // Starije spremljene vrijednosti nemaju popis promasaja.
  const wrong = latest?.wrong ?? [];
  const postotak = latest ? percentOf(latest.score, latest.total) : 0;
  const tone = toneForPercent(postotak);

  if (!latest) {
    return (
      <div className={stil.screen}>
        <ScreenHeader eyebrow="Quiz" title="Review" />
        {storageError && <StorageWarning message={storageError} />}
        <Panel title="No completed quizzes">
          <p className="small">Finish a quiz to see a result here.</p>
          <Link className={stil.button} to={RouteNames.QUIZ}>
            Start a quiz
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Quiz"
        title="Review"
        description="Scores are stored only in this browser."
      />
      {storageError && <StorageWarning message={storageError} />}

      <Panel title="Your score">
        <ProgressBar
          label="Correct"
          max={latest.total}
          showCount
          tone={tone}
          value={latest.score}
        />
        <p className="small">
          {wrong.length === 0
            ? "Every question correct."
            : `${wrong.length} to go over below.`}
        </p>
      </Panel>

      {wrong.length > 0 && (
        <Panel title="What to go over">
          <ul className={stil.reviewList}>
            {wrong.map((item) => {
              const question = questions.questions.find(
                (q) => q.id === item.questionId,
              );
              if (!question) return null;
              const step = march.steps.find((s) => s.id === question.stepId);

              return (
                <li className={stil.reviewItem} key={item.questionId}>
                  <p className={stil.reviewQuestion}>{question.question}</p>
                  <p className={`small ${stil.reviewWrong}`}>
                    <strong>You chose:</strong>{" "}
                    {item.picked === -1
                      ? "Time expired"
                      : question.options[item.picked]}
                  </p>
                  <p className={`small ${stil.reviewRight}`}>
                    <strong>Correct:</strong>{" "}
                    {question.options[question.correct]}
                  </p>
                  <p className="small">{question.why}</p>
                  {step && (
                    <Link
                      className={stil.reviewLink}
                      to={RouteNames.MARCH_STEP.replace(":stepId", step.id)}
                    >
                      Read the {step.title} card
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel title="Earlier attempts">
        {runs.length === 1 ? (
          <p className="small">This was your first attempt.</p>
        ) : (
          <ul className={stil.resultList}>
            {runs.slice(1, 11).map((run, index) => (
              <li key={run.id}>
                <span className="score">
                  {run.score}/{run.total}
                </span>
                <span className="small">Attempt {runs.length - 1 - index}</span>
              </li>
            ))}
          </ul>
        )}
        <Link className={stil.secondaryButton} to={RouteNames.QUIZ}>
          Practice again
        </Link>
      </Panel>
    </div>
  );
}

function ScenarioListScreen() {
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

function ScenarioRunScreen() {
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

const TQ_SITES = [
  "Left arm",
  "Right arm",
  "Left leg",
  "Right leg",
  "Junctional / other",
];

// Prag je u sekundama: vjezba primjene poveza ima rok od jedne minute,
// kako stoji i na kartici M ("stopped within 1 minute").
const TQ_DEFAULTS = { tqAlertSeconds: 60 };

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
function readTourniquet(stored) {
  const candidate = Array.isArray(stored) ? stored[0] : stored;
  if (!candidate || !Number.isFinite(candidate.startedAt)) return null;
  return {
    startedAt: candidate.startedAt,
    limb: candidate.limb ?? "",
    note: candidate.note ?? "",
  };
}

function TourniquetTimerScreen() {
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

function makeEmptyCard() {
  return Object.fromEntries(
    casualtyCard.fields.map((field) => [
      field.name,
      field.type === "checkbox-group"
        ? []
        : field.type === "checkbox"
          ? false
          : field.type === "repeating-group"
            ? []
            : "",
    ]),
  );
}

function CardListScreen() {
  const [cards, setCards, storageError] = useStoredState(
    STORAGE_KEYS.CARDS,
    [],
  );

  function removeCard(id) {
    if (!window.confirm("Delete this training card from this browser?")) return;
    setCards((savedCards) => savedCards.filter((card) => card.id !== id));
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training records"
        title="Casualty cards"
        description="Cards are stored locally in this browser. Enter training data only—never real patient details."
      >
        <Link className={stil.button} to={RouteNames.CARD_NEW}>
          New card
        </Link>
      </ScreenHeader>
      {storageError && <StorageWarning message={storageError} />}
      <Panel title="Blank card">
        <p className="small">
          Print an empty DD1380 to fill in by hand on the lane.
        </p>
        <Link
          className={stil.secondaryButton}
          to={RouteNames.CARD_PRINT.replace(":cardId", "prazna")}
        >
          Print a blank card
        </Link>
      </Panel>
      {cards.length === 0 ? (
        <Panel title="No saved cards">
          <p className="small">
            Create a training card for a practice scenario. No card data is
            uploaded.
          </p>
          <Link className={stil.button} to={RouteNames.CARD_NEW}>
            Create a card
          </Link>
        </Panel>
      ) : (
        <div className={stil.stepList}>
          {cards.map((card) => (
            <div className={stil.cardRow} key={card.id}>
              <Link
                className={stil.cardRowLink}
                to={RouteNames.CARD_ONE.replace(":cardId", card.id)}
              >
                <strong>{card.trainingId || "Training card"}</strong>
                <span className="small">
                  {card.date || "No date"} •{" "}
                  {card.casualtyNumber || "No number"}
                </span>
              </Link>
              <button
                aria-label={`Delete ${card.trainingId || "training card"}`}
                className={stil.iconButton}
                onClick={() => removeCard(card.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardEditorScreen() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards, storageError] = useStoredState(
    STORAGE_KEYS.CARDS,
    [],
  );
  const existing = cards.find((card) => card.id === cardId);
  const [form, setForm] = useState(() => existing || makeEmptyCard());
  const [formError, setFormError] = useState("");

  if (cardId && !existing && !storageError) {
    return <Navigate replace to={RouteNames.CARD} />;
  }

  function saveCard(event) {
    event.preventDefault();
    if (!form.trainingId.trim()) {
      setFormError("Enter a training ID, such as LANE 3 / MANIKIN B.");
      return;
    }

    const savedCard = {
      ...form,
      id: existing?.id || Date.now().toString(),
      updatedAt: new Date().toISOString(),
    };
    setCards((savedCards) =>
      existing
        ? savedCards.map((card) => (card.id === existing.id ? savedCard : card))
        : [savedCard, ...savedCards],
    );
    navigate(RouteNames.CARD_ONE.replace(":cardId", savedCard.id));
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training record"
        title={existing ? "Edit casualty card" : "New casualty card"}
        description="Use training identifiers only. Do not enter real names, service numbers, or patient data."
      >
        {existing && (
          <Link
            className={stil.secondaryButton}
            to={RouteNames.CARD_PRINT.replace(":cardId", existing.id)}
          >
            Print
          </Link>
        )}
      </ScreenHeader>
      {storageError && <StorageWarning message={storageError} />}
      <form className={stil.cardForm} onSubmit={saveCard}>
        {casualtyCard.fields.map((field) => (
          <CardField
            field={field}
            key={field.name}
            onChange={(value) =>
              setForm((current) => ({ ...current, [field.name]: value }))
            }
            value={form[field.name]}
          />
        ))}
        {formError && (
          <p className={stil.warning} role="alert">
            {formError}
          </p>
        )}
        <div className={stil.buttonRow}>
          <button className={stil.button} type="submit">
            Save training card
          </button>
          <Link className={stil.secondaryButton} to={RouteNames.CARD}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function CardField({ field, value, onChange }) {
  if (field.type === "repeating-group") {
    const rows = Array.isArray(value) ? value : [];
    return (
      <fieldset className={stil.fieldGroup}>
        <legend>{field.label}</legend>
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
        {rows.map((row, rowIndex) => (
          <div className={stil.repeatingRow} key={`${field.name}-${rowIndex}`}>
            <p className={`caption ${stil.eyebrow}`}>
              {field.label} {rowIndex + 1}
            </p>
            {field.fields.map((nestedField) => (
              <CardField
                field={nestedField}
                key={nestedField.name}
                onChange={(nextValue) =>
                  onChange(
                    rows.map((item, index) =>
                      index === rowIndex
                        ? { ...item, [nestedField.name]: nextValue }
                        : item,
                    ),
                  )
                }
                value={row[nestedField.name]}
              />
            ))}
            <button
              className={stil.secondaryButton}
              onClick={() =>
                onChange(rows.filter((_, index) => index !== rowIndex))
              }
              type="button"
            >
              Remove row
            </button>
          </div>
        ))}
        <button
          className={stil.secondaryButton}
          onClick={() => onChange([...rows, makeEmptyGroup(field.fields)])}
          type="button"
        >
          Add {field.label.toLowerCase()} row
        </button>
      </fieldset>
    );
  }

  if (field.type === "checkbox-group") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className={stil.fieldGroup}>
        <legend>{field.label}</legend>
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
        <div className={stil.choiceGrid}>
          {field.options.map((option) => (
            <label className={stil.choiceLabel} key={option}>
              <input
                checked={selected.includes(option)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option),
                  )
                }
                type="checkbox"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "radio") {
    return (
      <fieldset className={stil.fieldGroup}>
        <legend>{field.label}</legend>
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
        <div className={stil.choiceGrid}>
          {field.options.map((option) => (
            <label className={stil.choiceLabel} key={option}>
              <input
                checked={value === option}
                name={field.name}
                onChange={() => onChange(option)}
                type="radio"
                value={option}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className={`${stil.choiceLabel} ${stil.standaloneChoice}`}>
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>{field.label}</span>
        {field.helper && <small>{field.helper}</small>}
      </label>
    );
  }

  const common = {
    id: field.name,
    name: field.name,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
  };

  return (
    <div className={stil.fieldGroup}>
      <label className={stil.fieldLabel} htmlFor={field.name}>
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} />
      ) : field.type === "select" ? (
        <select {...common}>
          <option value="">Select…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          max={field.name === "gcsScore" ? 15 : undefined}
          min={field.name === "gcsScore" ? 3 : undefined}
          type={field.type}
        />
      )}
      {field.helper && <p className={`small ${stil.muted}`}>{field.helper}</p>}
    </div>
  );
}

function makeEmptyGroup(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, ""]));
}

// Ispis prati raspored DD Form 1380 (JUL 2025), TCCC CARD: prednja strana
// (roster, EVAC, mehanizam, ozljede s cetiri poveza, znakovi i simptomi) pa
// straznja (zbrinjavanje C-A-B-C, lijekovi, ostalo, biljeske).
//
// Dvije namjerne razlike od sluzbenog obrasca, obje zato sto je ovo vjezba:
//   - nema polja NAME ni LAST 4; identitet je iskljucivo Training ID
//   - nema CUI oznaka; oznaciti vjezbovni papir kao CUI bilo bi neistinito
// Zaglavlje zato izricito pise TRAINING CARD.

const DD_MECHANISM = [
  "Artillery",
  "Blunt",
  "Burn",
  "Fall",
  "Grenade",
  "GSW",
  "IED",
  "Landmine",
  "MVC",
  "RPG",
];

// Obrazac nudi Urgent/Priority/Routine, a kartica biljezi P1/P2/P3.
const EVAC_FROM_PRIORITY = { P1: "Urgent", P2: "Priority", P3: "Routine" };

const TQ_CORNERS = [
  { key: "R Arm", matches: ["Right arm"] },
  { key: "L Arm", matches: ["Left arm"] },
  { key: "R Leg", matches: ["Right leg"] },
  { key: "L Leg", matches: ["Left leg"] },
];

function Mark({ on }) {
  return (
    <span aria-hidden="true" className={stil.ddMark}>
      {on ? "X" : ""}
    </span>
  );
}

function Check({ label, on }) {
  return (
    <span className={stil.ddCheck}>
      <Mark on={on} />
      {label}
    </span>
  );
}

function Slot({ label, value, grow }) {
  return (
    <span className={grow ? `${stil.ddSlot} ${stil.ddGrow}` : stil.ddSlot}>
      <span className={stil.ddSlotLabel}>{label}</span>
      <span className={stil.ddSlotValue}>{value || " "}</span>
    </span>
  );
}

function has(list, value) {
  return Array.isArray(list) && list.includes(value);
}

function CardPrintScreen() {
  const { cardId } = useParams();
  const [cards] = useStoredState(STORAGE_KEYS.CARDS, []);
  const saved = cards.find((item) => item.id === cardId);
  // Kartica se ispisuje i bez podataka: prazne crte se popunjavaju rukom,
  // kao na papirnatom obrascu. Nepostojeci cardId daje praznu karticu.
  const card = saved ?? {};
  const blank = !saved;

  const tourniquets = Array.isArray(card.tourniquets) ? card.tourniquets : [];
  const vitals = Array.isArray(card.vitals) ? card.vitals : [];
  const drugs = Array.isArray(card.drugs) ? card.drugs : [];
  const evac = EVAC_FROM_PRIORITY[card.medevacPriority];
  const drugsOf = (category) =>
    drugs.filter((row) =>
      (row.category || "").toLowerCase().startsWith(category),
    );

  return (
    <div className={`${stil.screen} ${stil.printScreen}`}>
      <div className={`${stil.buttonRow} ${stil.noPrint}`}>
        <button
          className={stil.button}
          onClick={() => window.print()}
          type="button"
        >
          Print
        </button>
        <Link className={stil.secondaryButton} to={RouteNames.CARD}>
          Back to cards
        </Link>
      </div>

      {/* ---------------- prednja strana ---------------- */}
      <section className={stil.ddCard}>
        <h1 className={stil.ddTitle}>
          Tactical Combat Casualty Care (TCCC) Card
          <span className={stil.ddTraining}>
            {blank
              ? "Blank training card — fill in by hand"
              : "Training card — not a medical record"}
          </span>
        </h1>

        <div className={stil.ddBand}>
          <Slot grow label="Battle roster #" value={card.trainingId} />
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Evac:</span>
            <Check label="Urgent" on={evac === "Urgent"} />
            <Check label="Priority" on={evac === "Priority"} />
            <Check label="Routine" on={evac === "Routine"} />
          </span>
        </div>

        <div className={stil.ddBand}>
          <Slot
            grow
            label="Training ID (no name is recorded)"
            value={card.trainingId}
          />
          <Slot label="Casualty #" value={card.casualtyNumber} />
        </div>

        <div className={stil.ddBand}>
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Sex:</span>
            <Check label="M" on={card.sex === "Male"} />
            <Check label="F" on={card.sex === "Female"} />
          </span>
          <Slot label="Date" value={card.date} />
          <Slot label="Time" value={card.timeOfWounding} />
          <Slot label="Age" value={card.age} />
        </div>

        <div className={stil.ddBand}>
          <Slot label="Unit / lane" value={card.lane} />
          <Slot grow label="Allergies" value={card.allergies} />
          <Slot label="Blood type" value={card.bloodType} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>
            Mechanism of Injury (X all that apply)
          </p>
          <div className={stil.ddChecks}>
            {DD_MECHANISM.map((item) => (
              <Check
                key={item}
                label={item}
                on={
                  has(card.mechanism, item) ||
                  (item === "GSW" && has(card.mechanism, "GSW")) ||
                  (item === "IED" && has(card.mechanism, "Blast")) ||
                  (item === "MVC" && has(card.mechanism, "MVA"))
                }
              />
            ))}
            <Check label="Other" on={Boolean(card.mechanismOther)} />
            <Slot grow label="" value={card.mechanismOther} />
          </div>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Injury</p>
          <div className={stil.ddQuadrants}>
            {TQ_CORNERS.map((corner) => {
              const row = tourniquets.find((item) =>
                corner.matches.includes(item.site),
              );
              return (
                <div className={stil.ddQuadrant} key={corner.key}>
                  <p className={stil.ddQuadrantTitle}>TQ: {corner.key}</p>
                  <Slot label="Type" value={row?.note} />
                  <Slot label="Time" value={row?.timeApplied} />
                </div>
              );
            })}
          </div>
          <Slot
            grow
            label="Injuries found"
            value={(card.injuriesFound || []).join(", ")}
          />
          <Slot grow label="Injury sites" value={card.injurySites} />
          <Slot label="Burn TBSA %" value={card.burnTbsa} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Signs &amp; Symptoms</p>
          <table className={stil.ddTable}>
            <tbody>
              {[
                ["Time", (row) => row.time],
                ["Pulse (rate & location)", (row) => row.pulse],
                ["Blood pressure", (row) => row.bloodPressure],
                ["Respiratory rate", (row) => row.respiratoryRate],
                ["Pulse ox % O2 sat", (row) => row.spo2],
                ["Temperature", (row) => row.temperature],
                ["Capillary refill", (row) => row.capillaryRefill],
              ].map(([label, read]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {[0, 1, 2, 3].map((column) => (
                    <td key={column}>
                      {vitals[column] ? read(vitals[column]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">AVPU</th>
                <td>{card.avpu ? card.avpu.split(" ")[0] : ""}</td>
                <td>{card.avpuTime}</td>
                <td colSpan={2}>
                  {card.gcsScore
                    ? `GCS ${card.gcsScore} at ${card.gcsTime || "—"}`
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- straznja strana ---------------- */}
      <section className={stil.ddCard}>
        <p className={stil.ddHeading}>Treatments (X all that apply)</p>

        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>C:</span>
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>TQ-</span>
            <Check label="Extremity" on={tourniquets.length > 0} />
            <Check label="Junctional" on={false} />
            <Check label="Truncal" on={false} />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel} />
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Dressing-</span>
            <Check
              label="Hemostatic"
              on={has(card.massiveBleedingTreatment, "Hemostatic dressing")}
            />
            <Check
              label="Pressure"
              on={has(card.massiveBleedingTreatment, "Pressure bandage")}
            />
            <Check label="Other" on={false} />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>A:</span>
          <span className={stil.ddChecks}>
            <Check label="Intact" on={has(card.airwayTreatment, "Intact")} />
            <Check
              label="NPA"
              on={has(card.airwayTreatment, "NPA (nasopharyngeal airway)")}
            />
            <Check
              label="CRIC"
              on={has(card.airwayTreatment, "Cricothyroidotomy")}
            />
            <Check label="ET-Tube" on={false} />
            <Check
              label="SGA"
              on={has(card.airwayTreatment, "King LT (supraglottic airway)")}
            />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>B:</span>
          <span className={stil.ddChecks}>
            <Check label="O2" on={false} />
            <Check
              label="Needle-D"
              on={has(card.respirationTreatment, "Needle decompression")}
            />
            <Check label="Chest-Tube" on={false} />
            <Check
              label="Chest-Seal"
              on={has(card.respirationTreatment, "Chest seal")}
            />
          </span>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>C: fluids and blood</p>
          <Slot grow label="IV / IO access" value={card.vascularAccess} />
          <Slot grow label="Fluid / blood product" value={card.fluids} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Meds</p>
          <table className={stil.ddTable}>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Name</th>
                <th scope="col">Dose</th>
                <th scope="col">Route</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {["analgesic", "antibiotic", "other"].map((category) => {
                const rows = drugsOf(category);
                const list = rows.length > 0 ? rows : [{}];
                return list.map((row, index) => (
                  <tr key={`${category}-${index}`}>
                    <th scope="row">{index === 0 ? category : ""}</th>
                    <td>{row.drug}</td>
                    <td>{row.dose}</td>
                    <td>{row.route}</td>
                    <td>{row.time}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>Other:</span>
          <span className={stil.ddChecks}>
            <Check label="Combat-Pill-Pack" on={false} />
            <Check
              label="Eye-Shield"
              on={has(card.injuriesFound, "Eye injury")}
            />
            <Check label="Splint" on={has(card.injuriesFound, "Fracture")} />
            <Check
              label="Hypothermia-Prevention"
              on={Boolean(card.hypothermiaPrevention)}
            />
          </span>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Notes</p>
          <div className={stil.ddNotes}>
            {[
              ["S", card.signsSymptoms],
              ["A", card.allergies],
              ["M", card.medications],
              ["P", card.pastHistory],
              ["L", card.lastMeal],
              ["E", card.events],
              ["Head injury suspected", card.headInjurySuspected],
              ["Triage", card.triageCategory],
              ["Evacuation", card.evacuationMeans],
              ["Notes", card.notes],
            ].map(([label, value]) => (
              <Slot grow key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        <div className={stil.ddBand}>
          <Slot
            grow
            label="First responder (call sign)"
            value={card.responder}
          />
          <Slot label="Arrival time" value={card.arrivalTime} />
        </div>
      </section>
    </div>
  );
}

function ProgressScreen() {
  const [quizRuns, , quizError] = useStoredState(STORAGE_KEYS.QUIZ_RUNS, []);
  const [scenarioRuns, , scenarioError] = useStoredState(
    STORAGE_KEYS.SCENARIO_RUNS,
    [],
  );
  const latestQuiz = quizRuns[0];
  const averageScore =
    quizRuns.length > 0
      ? Math.round(
          (quizRuns.reduce((total, run) => total + run.score / run.total, 0) /
            quizRuns.length) *
            100,
        )
      : null;

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Local to this browser"
        title="Progress"
        description="Practice history is saved on this device only."
      />
      {(quizError || scenarioError) && (
        <StorageWarning message={quizError || scenarioError} />
      )}
      <div className={stil.statGrid}>
        <Panel title="Quiz attempts">
          <p className={stil.statNumber}>{quizRuns.length}</p>
          <p className="small">
            {latestQuiz
              ? `Latest: ${latestQuiz.score}/${latestQuiz.total}`
              : "No quiz completed yet"}
          </p>
        </Panel>
        <Panel title="Average score">
          <p className={stil.statNumber}>
            {averageScore === null ? "—" : `${averageScore}%`}
          </p>
          <p className="small">Across saved quiz attempts</p>
        </Panel>
        <Panel title="Scenario runs">
          <p className={stil.statNumber}>{scenarioRuns.length}</p>
          <p className="small">
            {scenarioRuns[0]?.title || "No scenario completed yet"}
          </p>
        </Panel>
      </div>
      <Panel title="Recent scenarios">
        {scenarioRuns.length === 0 ? (
          <p className="small">Complete a scenario to see it here.</p>
        ) : (
          <ul className={stil.resultList}>
            {scenarioRuns.slice(0, 10).map((run, index) => (
              <li key={run.id}>
                <span>
                  <strong>{run.title}</strong>
                  <span className={`small ${stil.muted}`}>
                    {run.mistakes} incorrect choices
                  </span>
                </span>
                <span className="small">Run {scenarioRuns.length - index}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div className={stil.screen}>
      <ScreenHeader eyebrow="Not found" title="Page unavailable" />
      <Panel>
        <p className="small">This screen does not exist.</p>
        <Link className={stil.button} to={RouteNames.HOME}>
          Go home
        </Link>
      </Panel>
    </div>
  );
}

export default App;
