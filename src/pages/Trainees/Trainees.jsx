import FormField from "../../components/FormField/FormField.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import stil from "../../styles/screens.module.css";
import { usePolaznik, usePolaznici } from "../../hooks/usePolaznici.js";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { RouteNames, TRAINEE_ROLES } from "../../lib/constants.js";
import { validatePolaznik } from "../../lib/validation.js";
import { useState } from "react";

const EMPTY_POLAZNIK = { pozivniZnak: "", uloga: "" };

const ROLE_OPTIONS = [
  { value: "", label: "Select…" },
  ...TRAINEE_ROLES.map((role) => ({ value: role, label: role })),
];

export function TraineeListScreen() {
  const { polaznici, loading, error, removePolaznik } = usePolaznici();

  function confirmRemove(polaznik) {
    if (!window.confirm(`Delete the trainee "${polaznik.pozivniZnak}"?`)) {
      return;
    }
    removePolaznik(polaznik.id);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training records"
        title="Trainees"
        description="Trainees are listed by call sign only. Never enter a real name or service number."
      >
        <Link className={stil.button} to={RouteNames.POLAZNIK_NEW}>
          New trainee
        </Link>
      </ScreenHeader>
      <div className={stil.buttonRow}>
        <Link className={stil.secondaryButton} to={RouteNames.VJEZBE}>
          Exercises
        </Link>
      </div>
      {error && <StorageWarning message={error} />}
      {loading ? (
        <Loading label="Loading trainees…" />
      ) : error && polaznici.length === 0 ? null : polaznici.length === 0 ? (
        <Panel title="No trainees yet">
          <p className="small">
            Add trainees by call sign, then assign them to exercises.
          </p>
          <Link className={stil.button} to={RouteNames.POLAZNIK_NEW}>
            Add a trainee
          </Link>
        </Panel>
      ) : (
        <div className={stil.stepList}>
          {polaznici.map((polaznik) => (
            <div className={stil.cardRow} key={polaznik.id}>
              <Link
                className={stil.cardRowLink}
                to={RouteNames.POLAZNIK_ONE.replace(
                  ":polaznikId",
                  polaznik.id,
                )}
              >
                <strong>{polaznik.pozivniZnak}</strong>
                <span className="small">
                  {polaznik.uloga} • {polaznik.brojVjezbi}{" "}
                  {polaznik.brojVjezbi === 1 ? "exercise" : "exercises"}
                </span>
              </Link>
              <button
                aria-label={`Delete ${polaznik.pozivniZnak}`}
                className={stil.iconButton}
                onClick={() => confirmRemove(polaznik)}
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

export function TraineeEditorScreen() {
  const { polaznikId } = useParams();
  const navigate = useNavigate();
  const {
    polaznik: existing,
    vjezbe,
    loading,
    error: loadError,
    save,
  } = usePolaznik(polaznikId);

  const [draft, setDraft] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = draft ?? {
    ...EMPTY_POLAZNIK,
    ...(existing && {
      pozivniZnak: existing.pozivniZnak ?? "",
      uloga: existing.uloga ?? "",
    }),
  };
  const errors = validatePolaznik(form);
  const errorFor = (name) =>
    submitted || touched[name] ? errors[name] : undefined;

  if (loading) {
    return (
      <div className={stil.screen}>
        <ScreenHeader eyebrow="Training record" title="Trainee" />
        <Loading label="Loading trainee…" />
      </div>
    );
  }

  if (polaznikId && !existing && !loadError) {
    return <Navigate replace to={RouteNames.POLAZNICI} />;
  }

  const field = (name) => ({
    id: name,
    value: form[name],
    error: errorFor(name),
    onChange: (value) => setDraft({ ...form, [name]: value }),
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
  });

  async function savePolaznik(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSaveError("");
    setSaving(true);
    try {
      await save({ ...form, pozivniZnak: form.pozivniZnak.trim() });
      navigate(RouteNames.POLAZNICI);
    } catch (error) {
      setSaveError(error.message);
      setSaving(false);
    }
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training record"
        title={existing ? "Edit trainee" : "New trainee"}
        description="Fields marked * are required."
      />
      {(loadError || saveError) && (
        <StorageWarning message={loadError || saveError} />
      )}
      <form className={stil.cardForm} noValidate onSubmit={savePolaznik}>
        <FormField
          {...field("pozivniZnak")}
          helper="Call sign only, for example ALPHA 1. Never a real name."
          label="Call sign"
          required
        />
        <FormField
          {...field("uloga")}
          label="Role"
          options={ROLE_OPTIONS}
          required
          type="select"
        />
        <div className={stil.buttonRow}>
          <button className={stil.button} disabled={saving} type="submit">
            {saving ? "Saving…" : "Save trainee"}
          </button>
          <Link className={stil.secondaryButton} to={RouteNames.POLAZNICI}>
            Cancel
          </Link>
        </div>
      </form>

      {existing && (
        <Panel title="Exercises this trainee took part in">
          {vjezbe.length === 0 ? (
            <p className="small">
              Not on any exercise yet. Open an exercise and tick this trainee.
            </p>
          ) : (
            <ul className={stil.contentList}>
              {vjezbe.map((vjezba) => (
                <li key={vjezba.id}>
                  <Link
                    to={RouteNames.VJEZBA_ONE.replace(":vjezbaId", vjezba.id)}
                  >
                    {vjezba.naziv}
                  </Link>
                  <span className={`small ${stil.muted}`}>
                    {vjezba.datum || "No date"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
