// Poruka kad spremiste nije dostupno. role="status", da je citac zaslona
// najavi bez prekidanja onoga sto korisnik radi.

import stil from "../../styles/screens.module.css";

export default function StorageWarning({ message }) {
  return (
    <p className={stil.warning} role="status">
      {message}
    </p>
  );
}
