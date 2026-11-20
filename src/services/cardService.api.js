// Kartice na posluzitelju (json-server, zbirka "cards" u db.json).

import { request } from "./http.js";

const PATH = "/cards";

export async function getAll() {
  const cards = await request(`${PATH}?_sort=updatedAt&_order=desc`);
  return Array.isArray(cards) ? cards : [];
}

export function getById(id) {
  return request(`${PATH}/${encodeURIComponent(id)}`);
}

export function create(card) {
  return request(PATH, { method: "POST", body: card });
}

export function update(id, card) {
  return request(`${PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: card,
  });
}

export async function remove(id) {
  await request(`${PATH}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
