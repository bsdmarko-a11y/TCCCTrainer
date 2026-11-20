import CheckboxGroup from "../../components/CheckboxGroup/CheckboxGroup.jsx";
import FormField from "../../components/FormField/FormField.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import stil from "../../styles/screens.module.css";
import { useVjezba, useVjezbe } from "../../hooks/useVjezbe.js";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { RouteNames } from "../../lib/constants.js";
import { validateVjezba } from "../../lib/validation.js";
import { useState } from "react";

const EMPTY_VJEZBA = { naziv: "", datum: "", lokacija: "", napomena: "" };

function count(number, one, many) {
  return `${number} ${number === 1 ? one : many}`;
}

export function ExerciseListScreen() {
  const { vjezbe, loading, error, removeVjezba } = useVjezbe();

  function confirmRemove(vjezba) {
    if (!window.confirm(`Delete the exercise "${vjezba.naziv}"?`)) return;
    removeVjezba(vjezba.id);
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training records"
        title="Exercises"
        description="An exercise groups the casualty cards written on it and the trainees who took part."
      >
        <Link className={stil.button} to={RouteNames.VJEZBA_NEW}>
          New exercise
        </Link>
      </ScreenHeader>
      <div className={stil.buttonRow}>
        <Link className={stil.secondaryButton} to={RouteNames.POLAZNICI}>
          Trainees
        </Link>
        <Link className={stil.secondaryButton} to={RouteNames.CARD}>
          Casualty cards
        </Link>
      </div>
      {error && <StorageWarning message={error} />}
      {loading ? (
        <Loading label="Loading exercises…" />
      ) : error && vjezbe.length === 0 ? null : vjezbe.length === 0 ? (
        <Panel title="No exercises yet">
          <p className="small">
            Create an exercise, then assign trainees and casualty cards to it.
          </p>
          <Link className={stil.button} to={RouteNames.VJEZBA_NEW}>
            Create an exercise
          </Link>
        </Panel>
      ) : (
        <div className={stil.stepList}>
          {vjezbe.map((vjezba) => (
            <div className={stil.cardRow} key={vjezba.id}>
              <Link
                className={stil.cardRowLink}
                to={RouteNames.VJEZBA_ONE.replace(":vjezbaId", vjezba.id)}
              >
                <strong>{vjezba.naziv}</strong>
                <span className="small">
                  {vjezba.datum || "No date"} •{" "}
                  {vjezba.lokacija || "No location"}
                </span>
                <span className="small">
                  {count(vjezba.brojPolaznika, "trainee", "trainees")} •{" "}
                  {count(vjezba.brojKartica, "card", "cards")}
                </span>
              </Link>
              <button
                aria-label={`Delete ${vjezba.naziv}`}
                className={stil.iconButton}
                onClick={() => confirmRemove(vjezba)}
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

export function ExerciseEditorScreen() {
  const { vjezbaId } = useParams();
  const navigate = useNavigate();
  const {
    vjezba: existing,
    polaznici,
    polaznikIds,
    cards,
    loading,
    error: loadError,
    save,
  } = useVjezba(vjezbaId);

  // Izmjene korisnika. Dok nista nije upisano, forma prikazuje dohvacenu
  // vjezbu (ili praznu) i dohvacene polaznike.
  const [draft, setDraft] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = draft ?? { ...EMPTY_VJEZBA, ...pickFields(existing) };
  const selected = selectedDraft ?? polaznikIds;
  const errors = validateVjezba(form);
  // Poruka se pokaze kad se polje napusti ili nakon pokusaja spremanja.
  const errorFor = (name) =>
    submitted || touched[name] ? errors[name] : undefined;

  if (loading) {
    return (
      <div className={stil.screen}>
        <ScreenHeader eyebrow="Training record" title="Exercise" />
        <Loading label="Loading exercise…" />
      </div>
    );
  }

  if (vjezbaId && !existing && !loadError) {
    return <Navigate replace to={RouteNames.VJEZBE} />;
  }

  const field = (name) => ({
    id: name,
    value: form[name],
    error: errorFor(name),
    onChange: (value) => setDraft({ ...form, [name]: value }),
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
  });

  async function saveVjezba(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSaveError("");
    setSaving(true);
    try {
      await save(
        {
          ...form,
          naziv: form.naziv.trim(),
          lokacija: form.lokacija.trim(),
        },
        selected,
      );
      navigate(RouteNames.VJEZBE);
    } catch (error) {
      setSaveError(error.message);
      setSaving(false);
    }
  }

  return (
    <div className={stil.screen}>
      <ScreenHeader
        eyebrow="Training record"
        title={existing ? "Edit exercise" : "New exercise"}
        description="Fields marked * are required."
      />
      {(loadError || saveError) && (
        <StorageWarning message={loadError || saveError} />
      )}
      <form className={stil.cardForm} noValidate onSubmit={saveVjezba}>
        <FormField
          {...field("naziv")}
          helper="For example: Lane 3, care under fire."
          label="Name"
          required
        />
        <FormField {...field("datum")} label="Date" required type="date" />
        <FormField {...field("lokacija")} label="Location" />
        <FormField {...field("napomena")} label="Note" type="textarea" />

        {polaznici.length === 0 ? (
          <Panel title="Trainees">
            <p className="small">
              No trainees yet. Add trainees first, then tick the ones who took
              part.
            </p>
            <Link className={stil.secondaryButton} to={RouteNames.POLAZNIK_NEW}>
              Add a trainee
            </Link>
          </Panel>
        ) : (
          <CheckboxGroup
            helper="Tick everyone who took part. A trainee can be on any number of exercises."
            legend="Trainees"
            onChange={setSelectedDraft}
            options={polaznici.map((polaznik) => ({
              value: polaznik.id,
              label: `${polaznik.pozivniZnak} (${polaznik.uloga})`,
            }))}
            selected={selected}
          />
        )}

        <div className={stil.buttonRow}>
          <button className={stil.button} disabled={saving} type="submit">
            {saving ? "Saving…" : "Save exercise"}
          </button>
          <Link className={stil.secondaryButton} to={RouteNames.VJEZBE}>
            Cancel
          </Link>
        </div>
      </form>

      {existing && (
        <Panel title="Casualty cards from this exercise">
          {cards.length === 0 ? (
            <p className="small">No cards have been written on this exercise.</p>
          ) : (
            <ul className={stil.contentList}>
              {cards.map((card) => (
                <li key={card.id}>
                  <Link to={RouteNames.CARD_ONE.replace(":cardId", card.id)}>
                    {card.trainingId || "Training card"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            className={stil.secondaryButton}
            to={`${RouteNames.CARD_NEW}?vjezba=${encodeURIComponent(existing.id)}`}
          >
            New card for this exercise
          </Link>
        </Panel>
      )}
    </div>
  );
}

// Iz spremljenog zapisa u formu idu samo polja forme (bez id-a i vremena).
function pickFields(vjezba) {
  if (!vjezba) return {};
  const { naziv = "", datum = "", lokacija = "", napomena = "" } = vjezba;
  return { naziv, datum, lokacija, napomena };
}
