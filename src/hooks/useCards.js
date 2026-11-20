// Logika dohvata kartica, odvojena od prikaza: zasloni dobiju podatke,
// stanje ucitavanja i poruku greske, a ne znaju nista o servisu.

import { useEffect, useState } from "react";

import * as cardService from "../services/cardService.js";

// Popis svih kartica, dohvacen pri ucitavanju zaslona.
export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Zaslon se moze zatvoriti prije nego odgovor stigne; tada se stanje
    // vise ne smije dirati.
    let active = true;

    cardService
      .getAll()
      .then((data) => {
        if (active) setCards(data);
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

  async function removeCard(id) {
    try {
      await cardService.remove(id);
      setCards((current) => current.filter((card) => card.id !== id));
      setError("");
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return { cards, loading, error, removeCard };
}

// Jedna kartica po id-u. Bez id-a (nova kartica) nema se sto dohvatiti.
export function useCard(cardId) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(Boolean(cardId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cardId) return undefined;
    let active = true;

    cardService
      .getById(cardId)
      .then((data) => {
        if (active) setCard(data);
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
  }, [cardId]);

  // Spremanje vraca spremljenu karticu; ako je u medjuvremenu obrisana,
  // servis vrati null i to je greska koju forma mora prikazati.
  async function save(form) {
    const saved = await cardService.save(form, card?.id);
    if (!saved) throw new Error("This card no longer exists.");
    return saved;
  }

  return { card, loading, error, save };
}
