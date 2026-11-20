// Izbor izvora podataka na jednom mjestu, za sve zbirke.
//
// Izvor se bira varijablom okoline, ne u kodu zaslona:
//   VITE_DATA_SOURCE=api    -> json-server preko fetch-a (npm run dev:api)
//   VITE_DATA_SOURCE=local  -> localStorage (zadano; tako radi i objavljena
//                              aplikacija, jer staticki posluzitelj nema API)

import { createApiCollection } from "./collection.api.js";
import { createLocalCollection } from "./collection.local.js";

export const DATA_SOURCE =
  import.meta.env.VITE_DATA_SOURCE === "api" ? "api" : "local";

export function createCollection({ storageKey, path }) {
  return DATA_SOURCE === "api"
    ? createApiCollection(path)
    : createLocalCollection(storageKey);
}

// Vrijeme plus slucajni dio: vise zapisa stvorenih u istoj milisekundi
// (npr. veze vjezbe i polaznika) ne smije dobiti isti id.
export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Svaki zapis dobiva id i vrijeme izmjene ovdje, da oba izvora spremaju
// isti oblik.
export function stamp(form, existingId) {
  return {
    ...form,
    id: existingId ?? newId(),
    updatedAt: new Date().toISOString(),
  };
}
