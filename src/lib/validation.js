// Pravila valjanosti formi vjezbe i polaznika. Svaka funkcija vraca objekt
// { polje: poruka } samo za polja koja nisu valjana; prazan objekt znaci da
// je forma ispravna.

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function validateVjezba({ naziv, datum, lokacija, napomena }) {
  const errors = {};
  const name = naziv.trim();

  if (!name) errors.naziv = "Enter a name for the exercise.";
  else if (name.length < 3) errors.naziv = "Use at least 3 characters.";
  else if (name.length > 60) errors.naziv = "Keep the name under 60 characters.";

  if (!datum) errors.datum = "Choose the date of the exercise.";
  else if (datum > today()) errors.datum = "The date cannot be in the future.";

  if (lokacija.trim().length > 60) {
    errors.lokacija = "Keep the location under 60 characters.";
  }
  if (napomena.length > 500) {
    errors.napomena = "Keep the note under 500 characters.";
  }
  return errors;
}

export function validatePolaznik({ pozivniZnak, uloga }) {
  const errors = {};
  const callSign = pozivniZnak.trim();

  if (!callSign) errors.pozivniZnak = "Enter a call sign.";
  else if (callSign.length < 2) errors.pozivniZnak = "Use at least 2 characters.";
  else if (callSign.length > 20) {
    errors.pozivniZnak = "Keep the call sign under 20 characters.";
  }

  if (!uloga) errors.uloga = "Choose a role.";
  return errors;
}
