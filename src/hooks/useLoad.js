// Dohvat podataka pri ucitavanju zaslona: poziva funkciju jednom, u
// useEffect, i vraca podatke, stanje ucitavanja i poruku greske.
//
// Zasloni za uredjivanje u App.jsx imaju key po putanji, pa se za drugi
// zapis komponenta stvara iznova i dohvat se ponavlja.

import { useEffect, useRef, useState } from "react";

export default function useLoad(load) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Funkcija dohvata s prvog iscrtavanja: dohvat ide jednom, pri ucitavanju.
  const loadRef = useRef(load);

  useEffect(() => {
    // Zaslon se moze zatvoriti prije nego odgovor stigne; tada se stanje
    // vise ne smije dirati.
    let active = true;

    loadRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error, setData, setError };
}
