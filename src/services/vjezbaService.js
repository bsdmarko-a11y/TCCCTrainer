// Servis za vjezbe. Vjezba je roditelj karticama (1:n) i jedna strana veze
// n:n s polaznicima.

import { STORAGE_KEYS } from "../lib/constants.js";
import * as cardService from "./cardService.js";
import { createCollection, stamp } from "./collection.js";
import * as vjezbaPolaznikService from "./vjezbaPolaznikService.js";

const vjezbe = createCollection({
  storageKey: STORAGE_KEYS.VJEZBE,
  path: "/vjezbe",
});

export const { getAll, getById } = vjezbe;

// Sprema vjezbu pa uskladjuje njezine polaznike u veznoj zbirci.
export async function save(form, existingId, polaznikIds) {
  const vjezba = stamp(form, existingId);
  const saved = existingId
    ? await vjezbe.update(existingId, vjezba)
    : await vjezbe.create(vjezba);
  if (!saved) return null;

  await vjezbaPolaznikService.setPolaznici(saved.id, polaznikIds);
  return saved;
}

// Vjezba s karticama se ne brise: kartice bi ostale bez roditelja. Parovi u
// veznoj zbirci se brisu zajedno s vjezbom.
export async function remove(id) {
  const cards = await cardService.getByVjezba(id);
  if (cards.length > 0) {
    throw new Error(
      `This exercise still has ${cards.length} casualty ${cards.length === 1 ? "card" : "cards"}. Delete the cards or move them to another exercise first.`,
    );
  }
  await vjezbaPolaznikService.removeByVjezba(id);
  await vjezbe.remove(id);
}
