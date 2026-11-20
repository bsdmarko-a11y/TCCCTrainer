import Panel from "../../components/Panel/Panel.jsx";
import ProgressBar from "../../components/ProgressBar/ProgressBar.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import Timer from "../../components/Timer/Timer.jsx";
import march from "../../data/march.json";
import questions from "../../data/questions.json";
import stil from "../../styles/screens.module.css";
import useStoredState from "../../hooks/useLocalStorage.js";
import { Link, useNavigate } from "react-router-dom";
import { RouteNames, STORAGE_KEYS } from "../../lib/constants.js";
import { percentOf, toneForPercent } from "../../lib/scoring.js";
import { useEffect, useRef, useState } from "react";

export function QuizScreen() {
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

export function QuizReviewScreen() {
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
