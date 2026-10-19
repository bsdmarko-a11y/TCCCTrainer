// Putanje se pisu na jednom mjestu. Nigdje u aplikaciji nema "/quiz" kao tekst -
// uvijek ide RouteNames.QUIZ, pa preimenovanje putanje ne lomi navigaciju.

export const RouteNames = {
  HOME: "/",
  MARCH: "/march",
  MARCH_STEP: "/march/:stepId",
  QUIZ: "/quiz",
  QUIZ_REVIEW: "/quiz/pregled",
  SCENARIO: "/scenario",
  SCENARIO_RUN: "/scenario/:scenarioId",
  TQ: "/tq",
  CARD: "/kartica",
  CARD_NEW: "/kartica/nova",
  CARD_ONE: "/kartica/:cardId",
  CARD_PRINT: "/kartica/:cardId/ispis",
  PROGRESS: "/napredak",
};

// Donja navigacija ima tocno pet odredista na svakom zaslonu (Korak 2).
export const NAV_ITEMS = [
  { to: RouteNames.HOME, label: "Home", icon: "home" },
  { to: RouteNames.MARCH, label: "Guide", icon: "guide" },
  { to: RouteNames.QUIZ, label: "Quiz", icon: "quiz" },
  { to: RouteNames.TQ, label: "Timer", icon: "timer" },
  { to: RouteNames.CARD, label: "Card", icon: "card" },
];

// Jedan imenski prostor, s verzijom, da se kasnija promjena sheme moze migrirati.
export const STORAGE_KEYS = {
  THEME: "tccc.v1.theme",
  TQ: "tccc.v1.tq",
  QUIZ_RUNS: "tccc.v1.quiz.runs",
  SCENARIO_RUNS: "tccc.v1.scenario.runs",
  CARDS: "tccc.v1.cards",
  SETTINGS: "tccc.v1.settings",
};

export const THEMES = {
  DARK: "dark",
  NIGHT: "night",
  PRINT: "print",
};
