import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import casualtyCard from "../../data/casualty-card.json";
import march from "../../data/march.json";
import questions from "../../data/questions.json";
import scenarios from "../../data/scenarios.json";
import stil from "../../styles/screens.module.css";
import { Link } from "react-router-dom";
import { RouteNames } from "../../lib/constants.js";

export function HomeScreen() {
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
