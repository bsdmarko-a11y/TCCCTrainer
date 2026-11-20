// Jedna zbirka zapisa u localStorageu. Isto sucelje kao collection.api.js, i
// isto asinkrono, pa servis iznad ne zna (i ne treba znati) koji je izvor.

import { readJson, writeJson } from "./storage.js";

// Najnovije izmijenjeni zapis je prvi, kao i kod posluzitelja.
function newestFirst(items) {
  return [...items].sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );
}

export function createLocalCollection(storageKey) {
  function readAll() {
    const items = readJson(storageKey, []);
    return Array.isArray(items) ? items : [];
  }

  return {
    async getAll() {
      return newestFirst(readAll());
    },

    // Zapisi kojima je polje jednako vrijednosti: strana "n" veze 1:n.
    async getWhere(field, value) {
      return newestFirst(readAll().filter((item) => item[field] === value));
    },

    async getById(id) {
      return readAll().find((item) => item.id === id) ?? null;
    },

    async create(item) {
      writeJson(storageKey, [item, ...readAll()]);
      return item;
    },

    async update(id, item) {
      const items = readAll();
      if (!items.some((current) => current.id === id)) return null;
      writeJson(
        storageKey,
        items.map((current) => (current.id === id ? item : current)),
      );
      return item;
    },

    async remove(id) {
      writeJson(
        storageKey,
        readAll().filter((item) => item.id !== id),
      );
    },
  };
}
