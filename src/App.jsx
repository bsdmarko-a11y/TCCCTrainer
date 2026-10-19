import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import casualtyCard from "./data/casualty-card.json";
import march from "./data/march.json";
import questions from "./data/questions.json";
import scenarios from "./data/scenarios.json";
import { NAV_ITEMS, RouteNames, STORAGE_KEYS, THEMES } from "./lib/constants.js";
import stil from "./App.module.css";

const STORAGE_ERROR = "Saved data could not be accessed. Your changes may not persist in this browser.";

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
  const isCardRoute = location.pathname.startsWith(RouteNames.CARD);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  return (
    <div className={stil.app}>
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

      <main className={stil.main}>
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

      <nav className={stil.bottomNav} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active =
            item.to === RouteNames.CARD
              ? isCardRoute
              : undefined;
          return (
            <NavLink
              className={({ isActive }) =>
                `${stil.navItem} ${active ?? isActive ? stil.navActive : ""}`
              }
              end={item.to === RouteNames.HOME}
              key={item.to}
              to={item.to}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function NavIcon({ name }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-7h6v7" />
      </>
    ),
    guide: (
      <>
        <path d="M4 5h16M4 12h16M4 19h16" />
        <path d="M8 5h.01M8 12h.01M8 19h.01" />
      </>
    ),
    quiz: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1.1-1.8 1.4-1.8 3" />
        <path d="M12 17h.01" />
      </>
    ),
    timer: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5M9 2h6M12 2v3" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h6M7 17h4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={stil.navIcon}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function PageHeading({ eyebrow, title, description, children }) {
  return (
    <header className={stil.pageHeading}>
      {eyebrow && <p className={`caption ${stil.eyebrow}`}>{eyebrow}</p>}
      <div className={stil.headingRow}>
        <h1 className="screen-title">{title}</h1>
        {children}
      </div>
      {description && <p className="small">{description}</p>}
    </header>
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
      <PageHeading
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
        <PageHeading
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
              <span className={stil.stepBadge}>{item.letter}</span>
              <span className={stil.stepText}>
                <strong>{item.title}</strong>
                <span className="small">{item.note}</span>
              </span>
              <span className={stil.muted}>{index + 1}/{march.steps.length}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const previous = march.steps[stepIndex - 1];
  const next = march.steps[stepIndex + 1];

  return (
    <div className={stil.screen}>
      <PageHeading
        eyebrow={`${step.phase} • Step ${stepIndex + 1} of ${march.steps.length}`}
        title={`${step.letter} — ${step.title}`}
        description={step.note}
      />
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
              <span className={stil.mistakeMark} aria-hidden="true">!</span>
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
        {next && (
          <Link
            className={stil.button}
            to={RouteNames.MARCH_STEP.replace(":stepId", next.id)}
          >
            Next topic
          </Link>
        )}
      </div>
    </div>
  );
}

function QuizScreen() {
  const navigate = useNavigate();
  const [runs, setRuns, storageError] = useStoredState(
    STORAGE_KEYS.QUIZ_RUNS,
    [],
  );
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
  const question = questions.questions[index];
  const selected =
    answer.questionId === question.id ? answer.value : null;
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
      id: String(runs.length + 1),
      score: finalScore,
      total: questions.questions.length,
    };
    setRuns((savedRuns) => [run, ...savedRuns]);
    navigate(RouteNames.QUIZ_REVIEW);
  }

  function advance() {
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
      <PageHeading
        eyebrow={`Question ${index + 1} of ${questions.questions.length}`}
        title="Knowledge quiz"
        description={`${remaining} seconds remaining`}
      />
      {storageError && <StorageWarning message={storageError} />}
      <div
        aria-label={`Question ${index + 1} of ${questions.questions.length}`}
        className={stil.progressTrack}
      >
        <span
          style={{
            width: `${((index + 1) / questions.questions.length) * 100}%`,
          }}
        />
      </div>
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
          <div className={finalAnswer === question.correct ? stil.feedbackGood : stil.feedbackBad}>
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
      <p className={`caption ${stil.muted}`}>
        {questions.guidelineVersion}
      </p>
    </div>
  );
}

function QuizReviewScreen() {
  const [runs, , storageError] = useStoredState(STORAGE_KEYS.QUIZ_RUNS, []);

  return (
    <div className={stil.screen}>
      <PageHeading
        eyebrow="Quiz"
        title="Practice history"
        description="Quiz scores are stored only in this browser."
      />
      {storageError && <StorageWarning message={storageError} />}
      {runs.length === 0 ? (
        <Panel title="No completed quizzes">
          <p className="small">Finish a quiz to see a result here.</p>
          <Link className={stil.button} to={RouteNames.QUIZ}>
            Start a quiz
          </Link>
        </Panel>
      ) : (
        <Panel title="Recent results">
          <ul className={stil.resultList}>
            {runs.map((run, index) => (
              <li key={run.id}>
                <span className="score">
                  {run.score}/{run.total}
                </span>
                <span className="small">Attempt {runs.length - index}</span>
              </li>
            ))}
          </ul>
          <Link className={stil.secondaryButton} to={RouteNames.QUIZ}>
            Practice again
          </Link>
        </Panel>
      )}
    </div>
  );
}

function ScenarioListScreen() {
  return (
    <div className={stil.screen}>
      <PageHeading
        eyebrow="Decision practice"
        title="Scenarios"
        description="Choose the next appropriate action. Incorrect choices explain why they do not fit the situation."
      />
      <div className={stil.stepList}>
        {scenarios.scenarios.map((scenario, index) => (
          <Link
            className={stil.scenarioLink}
            key={scenario.id}
            to={RouteNames.SCENARIO_RUN.replace(
              ":scenarioId",
              scenario.id,
            )}
          >
            <span className={stil.scenarioNumber}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={stil.stepText}>
              <strong>{scenario.title}</strong>
              <span className="small">{scenario.brief}</span>
            </span>
            <span aria-hidden="true" className={stil.modeArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ScenarioRunScreen() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const scenario = scenarios.scenarios.find((item) => item.id === scenarioId);
  const [runs, setRuns, storageError] = useStoredState(
    STORAGE_KEYS.SCENARIO_RUNS,
    [],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const saved = useRef(false);

  if (!scenario) return <Navigate replace to={RouteNames.SCENARIO} />;

  const currentStep = scenario.steps[stepIndex];
  const choicePool = [
    ...scenario.steps.slice(stepIndex),
    ...scenario.distractors,
  ];
  const rotation =
    (stepIndex * 3 + scenario.id.charCodeAt(1)) % choicePool.length;
  const choices = [
    ...choicePool.slice(rotation),
    ...choicePool.slice(0, rotation),
  ];

  function choose(option) {
    if (feedback || completed) return;
    if (option.id !== currentStep.id) {
      setMistakes((current) => current + 1);
      setFeedback({
        correct: false,
        title:
          scenario.steps.some((step) => step.id === option.id)
            ? "That action comes later"
            : "Not the best choice here",
        why: option.why,
      });
      return;
    }

    setFeedback({ correct: true, title: "Good choice", why: option.why });
    if (stepIndex === scenario.steps.length - 1) {
      setCompleted(true);
      if (!saved.current) {
        saved.current = true;
        const run = {
          id: `${scenario.id}-${runs.length + 1}`,
          scenarioId: scenario.id,
          title: scenario.title,
          mistakes,
        };
        setRuns((savedRuns) => [run, ...savedRuns]);
      }
    }
  }

  function nextStep() {
    if (completed) {
      navigate(RouteNames.SCENARIO);
      return;
    }
    setStepIndex((current) => current + 1);
    setFeedback(null);
  }

  return (
    <div className={stil.screen}>
      <PageHeading
        eyebrow={`Scenario • Step ${stepIndex + 1} of ${scenario.steps.length}`}
        title={scenario.title}
      />
      {storageError && <StorageWarning message={storageError} />}
      <Panel title="Situation">
        <p>{scenario.brief}</p>
      </Panel>
      {!completed && (
        <Panel title="What do you do next?">
          <div className={stil.optionList}>
            {choices.map((choice) => (
              <button
                className={stil.option}
                disabled={Boolean(feedback)}
                key={choice.id}
                onClick={() => choose(choice)}
                type="button"
              >
                {choice.label}
              </button>
            ))}
          </div>
          {feedback && (
            <div className={feedback.correct ? stil.feedbackGood : stil.feedbackBad}>
              <strong>{feedback.title}</strong>
              <p className="small">{feedback.why}</p>
              <button
                className={stil.button}
                onClick={feedback.correct ? nextStep : () => setFeedback(null)}
                type="button"
              >
                {feedback.correct
                  ? completed
                    ? "Back to scenarios"
                    : "Continue"
                  : "Try again"}
              </button>
            </div>
          )}
        </Panel>
      )}
      {completed && (
        <Panel title="Scenario complete">
          {feedback && (
            <p className="small">
              {feedback.title}: {feedback.why}
            </p>
          )}
          <p className="small">
            You completed the action sequence with {mistakes}{" "}
            {mistakes === 1 ? "incorrect choice" : "incorrect choices"}.
          </p>
          <Link className={stil.button} to={RouteNames.SCENARIO}>
            Choose another scenario
          </Link>
        </Panel>
      )}
    </div>
  );
}

function TourniquetTimerScreen() {
  const [timer, setTimer, storageError] = useStoredState(STORAGE_KEYS.TQ, {
    startedAt: null,
    elapsedMs: 0,
  });
  const [now, setNow] = useState(() => Date.now());
  const running = Number.isFinite(timer.startedAt) && timer.startedAt !== null;

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const elapsed = Math.max(
    0,
    (Number(timer.elapsedMs) || 0) + (running ? now - timer.startedAt : 0),
  );

  function start() {
    setNow(Date.now());
    setTimer((current) => ({
      ...current,
      startedAt: Date.now(),
    }));
  }

  function pause() {
    const stoppedAt = Date.now();
    setTimer((current) => ({
      elapsedMs:
        (Number(current.elapsedMs) || 0) + stoppedAt - current.startedAt,
      startedAt: null,
    }));
    setNow(stoppedAt);
  }

  function reset() {
    setTimer({ startedAt: null, elapsedMs: 0 });
    setNow(Date.now());
  }

  return (
    <div className={stil.screen}>
      <PageHeading
        eyebrow="Training timer"
        title="Tourniquet clock"
        description="Elapsed time for a training device. This timer does not provide medical alerts."
      />
      {storageError && <StorageWarning message={storageError} />}
      <Panel className={stil.timerPanel} title="Elapsed time">
        <p aria-live="off" className={stil.timerDigits}>
          {formatDuration(elapsed)}
        </p>
        <p className="small">
          {running ? "Timer running" : elapsed > 0 ? "Timer paused" : "Ready"}
        </p>
        <div className={stil.buttonRow}>
          {running ? (
            <button className={stil.button} onClick={pause} type="button">
              Pause
            </button>
          ) : (
            <button className={stil.button} onClick={start} type="button">
              {elapsed > 0 ? "Resume" : "Start"}
            </button>
          )}
          <button
            className={stil.secondaryButton}
            disabled={elapsed === 0}
            onClick={reset}
            type="button"
          >
            Reset
          </button>
        </div>
      </Panel>
      <p className={stil.safetyNotice}>
        Use only for training. Follow your course instructions and use a
        separate, approved timing method for real-world care.
      </p>
    </div>
  );
}

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
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
      <PageHeading
        eyebrow="Training records"
        title="Casualty cards"
        description="Cards are stored locally in this browser. Enter training data only—never real patient details."
      >
        <Link className={stil.button} to={RouteNames.CARD_NEW}>
          New card
        </Link>
      </PageHeading>
      {storageError && <StorageWarning message={storageError} />}
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
                  {card.date || "No date"} • {card.casualtyNumber || "No number"}
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
      <PageHeading
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
      </PageHeading>
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
        {field.helper && <p className={`small ${stil.muted}`}>{field.helper}</p>}
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
        {field.helper && <p className={`small ${stil.muted}`}>{field.helper}</p>}
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
        {field.helper && <p className={`small ${stil.muted}`}>{field.helper}</p>}
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

function CardPrintScreen() {
  const { cardId } = useParams();
  const [cards, , storageError] = useStoredState(STORAGE_KEYS.CARDS, []);
  const card = cards.find((item) => item.id === cardId);

  if (!card && !storageError) return <Navigate replace to={RouteNames.CARD} />;

  return (
    <div className={`${stil.screen} ${stil.printScreen}`}>
      {storageError && <StorageWarning message={storageError} />}
      <PageHeading eyebrow="Training record" title="Casualty card" />
      {card && (
        <>
          <div className={stil.printGrid}>
            {casualtyCard.fields.map((field) => (
              <PrintField
                field={field}
                key={field.name}
                value={card[field.name]}
              />
            ))}
          </div>
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
        </>
      )}
    </div>
  );
}

function PrintField({ field, value }) {
  if (
    value === undefined ||
    value === "" ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return null;
  }

  let display = value;
  if (Array.isArray(value)) {
    display = value
      .map((item) =>
        typeof item === "object"
          ? Object.entries(item)
              .filter(([, itemValue]) => itemValue !== "" && itemValue !== false)
              .map(([key, itemValue]) => `${key}: ${itemValue}`)
              .join(", ")
          : item,
      )
      .join("; ");
  } else if (typeof value === "boolean") {
    display = value ? "Yes" : "No";
  }

  return (
    <div className={stil.printField}>
      <strong>{field.label}</strong>
      <span>{display}</span>
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
      <PageHeading
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
      <PageHeading eyebrow="Not found" title="Page unavailable" />
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
