// Kartice u localStorageu. Isto sucelje kao cardService.api.js, i isto
// asinkrono, pa zaslon ne zna (i ne treba znati) odakle podaci dolaze.

import { STORAGE_KEYS } from "../lib/constants.js";
import { readJson, writeJson } from "./storage.js";

function readAll() {
  const cards = readJson(STORAGE_KEYS.CARDS, []);
  return Array.isArray(cards) ? cards : [];
}

// Najnovije izmijenjena kartica je prva, kao i kod posluzitelja.
function newestFirst(cards) {
  return [...cards].sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );
}

export async function getAll() {
  return newestFirst(readAll());
}

export async function getById(id) {
  return readAll().find((card) => card.id === id) ?? null;
}

export async function create(card) {
  writeJson(STORAGE_KEYS.CARDS, [card, ...readAll()]);
  return card;
}

export async function update(id, card) {
  const cards = readAll();
  if (!cards.some((item) => item.id === id)) return null;
  writeJson(
    STORAGE_KEYS.CARDS,
    cards.map((item) => (item.id === id ? card : item)),
  );
  return card;
}

export async function remove(id) {
  writeJson(
    STORAGE_KEYS.CARDS,
    readAll().filter((card) => card.id !== id),
  );
}
