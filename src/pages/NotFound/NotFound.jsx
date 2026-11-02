import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import stil from "../../styles/screens.module.css";
import { Link } from "react-router-dom";
import { RouteNames } from "../../lib/constants.js";

export function NotFoundScreen() {
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
