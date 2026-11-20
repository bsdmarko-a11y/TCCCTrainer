// Servis za kartice unesrecenog: jedino sto zasloni uvoze.
//
// Izvor podataka bira se varijablom okoline, ne u kodu zaslona:
//   VITE_DATA_SOURCE=api    -> json-server preko fetch-a (npm run dev:api)
//   VITE_DATA_SOURCE=local  -> localStorage (zadano; tako radi i objavljena
//                              aplikacija, jer staticki posluzitelj nema API)

import * as apiCards from "./cardService.api.js";
import * as localCards from "./cardService.local.js";

export const DATA_SOURCE =
  import.meta.env.VITE_DATA_SOURCE === "api" ? "api" : "local";

const source = DATA_SOURCE === "api" ? apiCards : localCards;

export const { getAll, getById, create, update, remove } = source;

// Nova kartica dobiva id i vrijeme izmjene ovdje, da oba izvora spremaju
// isti oblik zapisa.
export function save(form, existingId) {
  const card = {
    ...form,
    id: existingId ?? Date.now().toString(),
    updatedAt: new Date().toISOString(),
  };
  return existingId ? update(existingId, card) : create(card);
}
