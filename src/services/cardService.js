// Servis za kartice unesrecenog. Kartica pripada jednoj vjezbi (vjezbaId):
// to je strana "n" veze vjezba 1:n kartice.

import { STORAGE_KEYS } from "../lib/constants.js";
import { createCollection, stamp } from "./collection.js";

const cards = createCollection({
  storageKey: STORAGE_KEYS.CARDS,
  path: "/cards",
});

export const { getAll, getById, create, update, remove } = cards;

export function getByVjezba(vjezbaId) {
  return cards.getWhere("vjezbaId", vjezbaId);
}

export function save(form, existingId) {
  const card = stamp(form, existingId);
  return existingId ? update(existingId, card) : create(card);
}
