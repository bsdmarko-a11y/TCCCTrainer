// Jedno polje forme: oznaka, kontrola, pomocni tekst i poruka pogreske.
// Samo prikazuje; vrijednost i pravila valjanosti drzi zaslon.
//
// type je "text", "date" i slicno za <input>, ili "select" odnosno
// "textarea". Poruka pogreske je povezana s kontrolom preko aria-describedby,
// pa je citac zaslona procita uz polje.

import stil from "../../styles/screens.module.css";

export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helper,
  options = [],
  required = false,
  ...rest
}) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = {
    id,
    name: id,
    value: value ?? "",
    onChange: (event) => onChange(event.target.value),
    onBlur,
    "aria-required": required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [helperId, errorId].filter(Boolean).join(" ") || undefined,
    ...rest,
  };

  return (
    <div className={stil.fieldGroup}>
      <label className={stil.fieldLabel} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {type === "textarea" ? (
        <textarea {...control} rows={3} />
      ) : type === "select" ? (
        <select {...control}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...control} type={type} />
      )}
      {helper && (
        <p className={`small ${stil.muted}`} id={helperId}>
          {helper}
        </p>
      )}
      {error && (
        <p className={`small ${stil.fieldError}`} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
