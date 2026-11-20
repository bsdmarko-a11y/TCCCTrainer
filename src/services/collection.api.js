// Jedna zbirka zapisa na posluzitelju (json-server, zbirka u db.json).

import { request } from "./http.js";

const NEWEST_FIRST = "_sort=updatedAt&_order=desc";

export function createApiCollection(path) {
  const one = (id) => `${path}/${encodeURIComponent(id)}`;

  return {
    async getAll() {
      const items = await request(`${path}?${NEWEST_FIRST}`);
      return Array.isArray(items) ? items : [];
    },

    // json-server filtrira po polju iz upita: /cards?vjezbaId=v1
    async getWhere(field, value) {
      const items = await request(
        `${path}?${field}=${encodeURIComponent(value)}&${NEWEST_FIRST}`,
      );
      return Array.isArray(items) ? items : [];
    },

    getById(id) {
      return request(one(id));
    },

    create(item) {
      return request(path, { method: "POST", body: item });
    },

    update(id, item) {
      return request(one(id), { method: "PUT", body: item });
    },

    async remove(id) {
      await request(one(id), { method: "DELETE" });
    },
  };
}
