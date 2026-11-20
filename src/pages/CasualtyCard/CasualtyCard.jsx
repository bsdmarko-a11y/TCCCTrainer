import Panel from "../../components/Panel/Panel.jsx";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader.jsx";
import StorageWarning from "../../components/StorageWarning/StorageWarning.jsx";
import casualtyCard from "../../data/casualty-card.json";
import stil from "../../styles/screens.module.css";
import useStoredState from "../../hooks/useLocalStorage.js";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { RouteNames, STORAGE_KEYS } from "../../lib/constants.js";
import { printCard } from "../../lib/print.js";
import { useState } from "react";

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

export function CardListScreen() {
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
      <ScreenHeader
        eyebrow="Training records"
        title="Casualty cards"
        description="Cards are stored locally in this browser. Enter training data only—never real patient details."
      >
        <Link className={stil.button} to={RouteNames.CARD_NEW}>
          New card
        </Link>
      </ScreenHeader>
      {storageError && <StorageWarning message={storageError} />}
      <Panel title="Blank card">
        <p className="small">
          Print an empty DD1380 to fill in by hand on the lane.
        </p>
        <Link
          className={stil.secondaryButton}
          to={RouteNames.CARD_PRINT.replace(":cardId", "prazna")}
        >
          Print a blank card
        </Link>
      </Panel>
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
                  {card.date || "No date"} •{" "}
                  {card.casualtyNumber || "No number"}
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

export function CardEditorScreen() {
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
      <ScreenHeader
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
      </ScreenHeader>
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
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
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
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
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
        {field.helper && (
          <p className={`small ${stil.muted}`}>{field.helper}</p>
        )}
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

// Ispis prati raspored DD Form 1380 (JUL 2025), TCCC CARD: prednja strana
// (roster, EVAC, mehanizam, ozljede s cetiri poveza, znakovi i simptomi) pa
// straznja (zbrinjavanje C-A-B-C, lijekovi, ostalo, biljeske).
//
// Dvije namjerne razlike od sluzbenog obrasca, obje zato sto je ovo vjezba:
//   - nema polja NAME ni LAST 4; identitet je iskljucivo Training ID
//   - nema CUI oznaka; oznaciti vjezbovni papir kao CUI bilo bi neistinito
// Zaglavlje zato izricito pise TRAINING CARD.

const DD_MECHANISM = [
  "Artillery",
  "Blunt",
  "Burn",
  "Fall",
  "Grenade",
  "GSW",
  "IED",
  "Landmine",
  "MVC",
  "RPG",
];

// Obrazac nudi Urgent/Priority/Routine, a kartica biljezi P1/P2/P3.

// Obrazac nudi Urgent/Priority/Routine, a kartica biljezi P1/P2/P3.
const EVAC_FROM_PRIORITY = { P1: "Urgent", P2: "Priority", P3: "Routine" };

const TQ_CORNERS = [
  { key: "R Arm", matches: ["Right arm"] },
  { key: "L Arm", matches: ["Left arm"] },
  { key: "R Leg", matches: ["Right leg"] },
  { key: "L Leg", matches: ["Left leg"] },
];

function Mark({ on }) {
  return (
    <span aria-hidden="true" className={stil.ddMark}>
      {on ? "X" : ""}
    </span>
  );
}

function Check({ label, on }) {
  return (
    <span className={stil.ddCheck}>
      <Mark on={on} />
      {label}
    </span>
  );
}

function Slot({ label, value, grow }) {
  return (
    <span className={grow ? `${stil.ddSlot} ${stil.ddGrow}` : stil.ddSlot}>
      <span className={stil.ddSlotLabel}>{label}</span>
      <span className={stil.ddSlotValue}>{value || " "}</span>
    </span>
  );
}

function has(list, value) {
  return Array.isArray(list) && list.includes(value);
}

export function CardPrintScreen() {
  const { cardId } = useParams();
  const [cards] = useStoredState(STORAGE_KEYS.CARDS, []);
  const saved = cards.find((item) => item.id === cardId);
  // Kartica se ispisuje i bez podataka: prazne crte se popunjavaju rukom,
  // kao na papirnatom obrascu. Nepostojeci cardId daje praznu karticu.
  const card = saved ?? {};
  const blank = !saved;

  const tourniquets = Array.isArray(card.tourniquets) ? card.tourniquets : [];
  const vitals = Array.isArray(card.vitals) ? card.vitals : [];
  const drugs = Array.isArray(card.drugs) ? card.drugs : [];
  const evac = EVAC_FROM_PRIORITY[card.medevacPriority];
  const drugsOf = (category) =>
    drugs.filter((row) =>
      (row.category || "").toLowerCase().startsWith(category),
    );

  return (
    <div className={`${stil.screen} ${stil.printScreen}`}>
      <div className={`${stil.buttonRow} ${stil.noPrint}`}>
        <button
          className={stil.button}
          onClick={() => printCard(card.trainingId)}
          type="button"
        >
          Print or save as PDF
        </button>
        <Link className={stil.secondaryButton} to={RouteNames.CARD}>
          Back to cards
        </Link>
      </div>
      <p className={`small ${stil.noPrint} ${stil.muted}`}>
        Choose <strong>Save as PDF</strong> as the destination to keep a copy.
        It prints on A4, front page then back page.
      </p>

      {/* ---------------- prednja strana ---------------- */}
      <section className={stil.ddCard}>
        <h1 className={stil.ddTitle}>
          Tactical Combat Casualty Care (TCCC) Card
          <span className={stil.ddTraining}>
            {blank
              ? "Blank training card — fill in by hand"
              : "Training card — not a medical record"}
          </span>
        </h1>

        <div className={stil.ddBand}>
          <Slot grow label="Battle roster #" value={card.trainingId} />
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Evac:</span>
            <Check label="Urgent" on={evac === "Urgent"} />
            <Check label="Priority" on={evac === "Priority"} />
            <Check label="Routine" on={evac === "Routine"} />
          </span>
        </div>

        <div className={stil.ddBand}>
          <Slot
            grow
            label="Training ID (no name is recorded)"
            value={card.trainingId}
          />
          <Slot label="Casualty #" value={card.casualtyNumber} />
        </div>

        <div className={stil.ddBand}>
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Sex:</span>
            <Check label="M" on={card.sex === "Male"} />
            <Check label="F" on={card.sex === "Female"} />
          </span>
          <Slot label="Date" value={card.date} />
          <Slot label="Time" value={card.timeOfWounding} />
          <Slot label="Age" value={card.age} />
        </div>

        <div className={stil.ddBand}>
          <Slot label="Unit / lane" value={card.lane} />
          <Slot grow label="Allergies" value={card.allergies} />
          <Slot label="Blood type" value={card.bloodType} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>
            Mechanism of Injury (X all that apply)
          </p>
          <div className={stil.ddChecks}>
            {DD_MECHANISM.map((item) => (
              <Check
                key={item}
                label={item}
                on={
                  has(card.mechanism, item) ||
                  (item === "GSW" && has(card.mechanism, "GSW")) ||
                  (item === "IED" && has(card.mechanism, "Blast")) ||
                  (item === "MVC" && has(card.mechanism, "MVA"))
                }
              />
            ))}
            <Check label="Other" on={Boolean(card.mechanismOther)} />
            <Slot grow label="" value={card.mechanismOther} />
          </div>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Injury</p>
          <div className={stil.ddQuadrants}>
            {TQ_CORNERS.map((corner) => {
              const row = tourniquets.find((item) =>
                corner.matches.includes(item.site),
              );
              return (
                <div className={stil.ddQuadrant} key={corner.key}>
                  <p className={stil.ddQuadrantTitle}>TQ: {corner.key}</p>
                  <Slot label="Type" value={row?.note} />
                  <Slot label="Time" value={row?.timeApplied} />
                </div>
              );
            })}
          </div>
          <Slot
            grow
            label="Injuries found"
            value={(card.injuriesFound || []).join(", ")}
          />
          <Slot grow label="Injury sites" value={card.injurySites} />
          <Slot label="Burn TBSA %" value={card.burnTbsa} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Signs &amp; Symptoms</p>
          <table className={stil.ddTable}>
            <tbody>
              {[
                ["Time", (row) => row.time],
                ["Pulse (rate & location)", (row) => row.pulse],
                ["Blood pressure", (row) => row.bloodPressure],
                ["Respiratory rate", (row) => row.respiratoryRate],
                ["Pulse ox % O2 sat", (row) => row.spo2],
                ["Temperature", (row) => row.temperature],
                ["Capillary refill", (row) => row.capillaryRefill],
              ].map(([label, read]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {[0, 1, 2, 3].map((column) => (
                    <td key={column}>
                      {vitals[column] ? read(vitals[column]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
              {/* AVPU i bol su redovi kao i ostali, po jedna celija za svaki
                  trenutak mjerenja. Kartica biljezi jedan AVPU, pa ide u prvi
                  stupac, a ostali ostaju prazni za rukopis. */}
              <tr>
                <th scope="row">AVPU</th>
                <td>{card.avpu ? card.avpu.split(" ")[0] : ""}</td>
                <td />
                <td />
                <td />
              </tr>
              <tr>
                <th scope="row">Pain scale (0-10)</th>
                <td />
                <td />
                <td />
                <td />
              </tr>
            </tbody>
          </table>
          <div className={stil.ddBand}>
            <Slot label="AVPU time" value={card.avpuTime} />
            <Slot label="GCS" value={card.gcsScore} />
            <Slot label="GCS time" value={card.gcsTime} />
            <Slot
              grow
              label="Pupils equal and reactive"
              value={card.pupilsEqualReactive ? "Yes" : ""}
            />
          </div>
        </div>
      </section>

      {/* ---------------- straznja strana ---------------- */}
      <section className={stil.ddCard}>
        <p className={stil.ddHeading}>Treatments (X all that apply)</p>

        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>C:</span>
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>TQ-</span>
            <Check label="Extremity" on={tourniquets.length > 0} />
            <Check label="Junctional" on={false} />
            <Check label="Truncal" on={false} />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel} />
          <span className={stil.ddChecks}>
            <span className={stil.ddSlotLabel}>Dressing-</span>
            <Check
              label="Hemostatic"
              on={has(card.massiveBleedingTreatment, "Hemostatic dressing")}
            />
            <Check
              label="Pressure"
              on={has(card.massiveBleedingTreatment, "Pressure bandage")}
            />
            <Check label="Other" on={false} />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>A:</span>
          <span className={stil.ddChecks}>
            <Check label="Intact" on={has(card.airwayTreatment, "Intact")} />
            <Check
              label="NPA"
              on={has(card.airwayTreatment, "NPA (nasopharyngeal airway)")}
            />
            <Check
              label="CRIC"
              on={has(card.airwayTreatment, "Cricothyroidotomy")}
            />
            <Check label="ET-Tube" on={false} />
            <Check
              label="SGA"
              on={has(card.airwayTreatment, "King LT (supraglottic airway)")}
            />
          </span>
        </div>
        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>B:</span>
          <span className={stil.ddChecks}>
            <Check label="O2" on={false} />
            <Check
              label="Needle-D"
              on={has(card.respirationTreatment, "Needle decompression")}
            />
            <Check label="Chest-Tube" on={false} />
            <Check
              label="Chest-Seal"
              on={has(card.respirationTreatment, "Chest seal")}
            />
          </span>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>C: fluids and blood</p>
          <Slot grow label="IV / IO access" value={card.vascularAccess} />
          <Slot grow label="Fluid / blood product" value={card.fluids} />
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Meds</p>
          <table className={stil.ddTable}>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Name</th>
                <th scope="col">Dose</th>
                <th scope="col">Route</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {["analgesic", "antibiotic", "other"].map((category) => {
                const rows = drugsOf(category);
                const list = rows.length > 0 ? rows : [{}];
                return list.map((row, index) => (
                  <tr key={`${category}-${index}`}>
                    <th scope="row">{index === 0 ? category : ""}</th>
                    <td>{row.drug}</td>
                    <td>{row.dose}</td>
                    <td>{row.route}</td>
                    <td>{row.time}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        <div className={stil.ddBand}>
          <span className={stil.ddRowLabel}>Other:</span>
          <span className={stil.ddChecks}>
            <Check label="Combat-Pill-Pack" on={false} />
            <Check
              label="Eye-Shield"
              on={has(card.injuriesFound, "Eye injury")}
            />
            <Check label="Splint" on={has(card.injuriesFound, "Fracture")} />
            <Check
              label="Hypothermia-Prevention"
              on={Boolean(card.hypothermiaPrevention)}
            />
          </span>
        </div>

        <div className={stil.ddSection}>
          <p className={stil.ddHeading}>Notes</p>
          <div className={stil.ddNotes}>
            {[
              ["S", card.signsSymptoms],
              ["A", card.allergies],
              ["M", card.medications],
              ["P", card.pastHistory],
              ["L", card.lastMeal],
              ["E", card.events],
              ["Head injury suspected", card.headInjurySuspected],
              ["Triage", card.triageCategory],
              ["Evacuation", card.evacuationMeans],
              ["Notes", card.notes],
            ].map(([label, value]) => (
              <Slot grow key={label} label={label} value={value} />
            ))}
          </div>
        </div>

        <div className={stil.ddBand}>
          <Slot
            grow
            label="First responder (call sign)"
            value={card.responder}
          />
          <Slot label="Arrival time" value={card.arrivalTime} />
        </div>
      </section>
    </div>
  );
}

// Prosjek preskace zapise bez bodova: stariji scenariji su biljezili samo
// broj pogresaka, pa bi ih racunanje kao nulu lazno srusilo.
