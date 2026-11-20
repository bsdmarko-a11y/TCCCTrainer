// Najnizi sloj: citanje i pisanje JSON-a u window.localStorage.
//
// Za razliku od hooka useStoredState, ovdje se greska baca, a ne guta:
// servis iznad odlucuje sto s njom, a zaslon je prikazuje kao poruku.

export const STORAGE_ERROR =
  "Saved data could not be accessed. Your changes may not persist in this browser.";

export function readJson(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    throw new Error(STORAGE_ERROR, { cause: error });
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    throw new Error(STORAGE_ERROR, { cause: error });
  }
}
