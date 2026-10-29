// Ikone su inline SVG, 24px na 24px kutiji, debljina poteza 1.75,
// i nasljeduju currentColor - boju postavlja roditelj, ikona je ne zna.
// Uvijek aria-hidden: uz ikonu stoji tekst koji je pravi naziv.

const PUTANJE = {
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  guide: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M7 7V4h10v3" />
      <path d="M8 12h8M8 16h5" />
    </>
  ),
  quiz: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" />
      <path d="M12 17h.01" />
    </>
  ),
  scenario: (
    <>
      <circle cx="8" cy="8" r="2.4" />
      <path d="M4 20h16" />
      <path d="M5 16h14" />
      <path d="M11 16 9 11h4l1.5 5" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13V9" />
      <path d="M12 13l-3 2" />
      <path d="M9.5 3.5h5" />
    </>
  ),
  card: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v2.5H9z" />
      <path d="M8.5 11h7M8.5 15h4.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V5" />
      <path d="M4 20h16" />
      <path d="M8 20v-6M13 20V9M18 20v-4" />
    </>
  ),
};

export default function Icon({ name, size = 24, className }) {
  const putanja = PUTANJE[name];
  if (!putanja) return null;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width={size}
    >
      {putanja}
    </svg>
  );
}
