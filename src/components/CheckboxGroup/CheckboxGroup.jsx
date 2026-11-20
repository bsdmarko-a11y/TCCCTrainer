// Skupina kvacica za odabir vise stavki. Samo prikazuje: popis odabranih
// vrijednosti drzi zaslon, a ovdje se javlja novi popis.

import stil from "../../styles/screens.module.css";

export default function CheckboxGroup({
  legend,
  helper,
  options,
  selected,
  onChange,
}) {
  return (
    <fieldset className={stil.fieldGroup}>
      <legend>{legend}</legend>
      {helper && <p className={`small ${stil.muted}`}>{helper}</p>}
      <div className={stil.choiceGrid}>
        {options.map((option) => (
          <label className={stil.choiceLabel} key={option.value}>
            <input
              checked={selected.includes(option.value)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((value) => value !== option.value),
                )
              }
              type="checkbox"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
