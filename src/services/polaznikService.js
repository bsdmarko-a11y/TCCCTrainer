// Servis za polaznike. Polaznik je druga strana veze n:n s vjezbama.
// Polaznik se vodi pod pozivnim znakom; pravo ime se nigdje ne sprema.

import { STORAGE_KEYS } from "../lib/constants.js";
import { createCollection, stamp } from "./collection.js";
import * as vjezbaPolaznikService from "./vjezbaPolaznikService.js";
import * as vjezbaService from "./vjezbaService.js";

const polaznici = createCollection({
  storageKey: STORAGE_KEYS.POLAZNICI,
  path: "/polaznici",
});

export const { getAll, getById } = polaznici;

export function save(form, existingId) {
  const polaznik = stamp(form, existingId);
  return existingId
    ? polaznici.update(existingId, polaznik)
    : polaznici.create(polaznik);
}

// Vjezbe u kojima polaznik sudjeluje: preko vezne zbirke do vjezbi.
export async function getVjezbe(polaznikId) {
  const [veze, vjezbe] = await Promise.all([
    vjezbaPolaznikService.getByPolaznik(polaznikId),
    vjezbaService.getAll(),
  ]);
  const ids = new Set(veze.map((veza) => veza.vjezbaId));
  return vjezbe.filter((vjezba) => ids.has(vjezba.id));
}

// S polaznikom nestaju i njegovi parovi u veznoj zbirci; vjezbe ostaju.
export async function remove(id) {
  await vjezbaPolaznikService.removeByPolaznik(id);
  await polaznici.remove(id);
}
