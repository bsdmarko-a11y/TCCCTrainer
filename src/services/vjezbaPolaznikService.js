// Vezna zbirka veze n:n izmedju vjezbi i polaznika. Svaki zapis je jedan par
// { vjezbaId, polaznikId }: jedna vjezba ima vise polaznika, a jedan polaznik
// sudjeluje u vise vjezbi.

import { STORAGE_KEYS } from "../lib/constants.js";
import { createCollection, stamp } from "./collection.js";

const veze = createCollection({
  storageKey: STORAGE_KEYS.VJEZBA_POLAZNIK,
  path: "/vjezbaPolaznik",
});

export const { getAll } = veze;

export function getByVjezba(vjezbaId) {
  return veze.getWhere("vjezbaId", vjezbaId);
}

export function getByPolaznik(polaznikId) {
  return veze.getWhere("polaznikId", polaznikId);
}

// Uskladjuje parove jedne vjezbe s odabranim polaznicima: brise samo one
// koji su odznaceni i dodaje samo nove. Pozivi idu jedan za drugim, jer
// oba izvora pisu u istu zbirku.
export async function setPolaznici(vjezbaId, polaznikIds) {
  const current = await getByVjezba(vjezbaId);
  const wanted = new Set(polaznikIds);
  const present = new Set(current.map((veza) => veza.polaznikId));

  for (const veza of current) {
    if (!wanted.has(veza.polaznikId)) await veze.remove(veza.id);
  }
  for (const polaznikId of wanted) {
    if (!present.has(polaznikId)) {
      await veze.create(stamp({ vjezbaId, polaznikId }));
    }
  }
}

async function removeAll(items) {
  for (const veza of items) await veze.remove(veza.id);
}

export async function removeByVjezba(vjezbaId) {
  await removeAll(await getByVjezba(vjezbaId));
}

export async function removeByPolaznik(polaznikId) {
  await removeAll(await getByPolaznik(polaznikId));
}
