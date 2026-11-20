// Pokazivac ucitavanja dok podaci stizu iz servisa. role="status" ga najavi
// citacu zaslona; kruzic je ukras, tekst je poruka.

import stil from "./Loading.module.css";

export default function Loading({ label = "Loading…" }) {
  return (
    <p className={stil.ucitavanje} role="status">
      <span aria-hidden="true" className={stil.kruzic} />
      {label}
    </p>
  );
}
