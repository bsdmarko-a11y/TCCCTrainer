import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import BottomNav from "./components/BottomNav/BottomNav.jsx";
import StorageWarning from "./components/StorageWarning/StorageWarning.jsx";
import UpdatePrompt from "./components/UpdatePrompt/UpdatePrompt.jsx";
import useStoredState from "./hooks/useLocalStorage.js";
import { RouteNames, STORAGE_KEYS, THEMES } from "./lib/constants.js";
import {
  CardEditorScreen,
  CardListScreen,
  CardPrintScreen,
} from "./pages/CasualtyCard/CasualtyCard.jsx";
import { HomeScreen } from "./pages/Home/Home.jsx";
import { MarchScreen } from "./pages/MarchGuide/MarchGuide.jsx";
import { NotFoundScreen } from "./pages/NotFound/NotFound.jsx";
import { ProgressScreen } from "./pages/Progress/Progress.jsx";
import { QuizReviewScreen, QuizScreen } from "./pages/Quiz/Quiz.jsx";
import {
  ScenarioListScreen,
  ScenarioRunScreen,
} from "./pages/Scenario/Scenario.jsx";
import { TourniquetTimerScreen } from "./pages/TQTimer/TQTimer.jsx";
import stil from "./styles/screens.module.css";

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
      {!isPrintRoute && <UpdatePrompt />}
    </div>
  );
}

export default App;
