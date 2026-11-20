import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import march from "../../data/march.json";
import stil from "../../styles/screens.module.css";
import useSwipe, { useArrowKeys } from "../../hooks/useSwipe.js";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { RouteNames } from "../../lib/constants.js";
import { useCallback, useRef } from "react";

export function MarchScreen() {
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
