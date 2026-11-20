// Logika zaslona vjezbi, odvojena od prikaza.

import * as cardService from "../services/cardService.js";
import * as polaznikService from "../services/polaznikService.js";
import * as vjezbaPolaznikService from "../services/vjezbaPolaznikService.js";
import * as vjezbaService from "../services/vjezbaService.js";
import useLoad from "./useLoad.js";

// Popis vjezbi s brojem polaznika (n:n) i brojem kartica (1:n) uz svaku.
export function useVjezbe() {
  const { data, loading, error, setData, setError } = useLoad(async () => {
    const [vjezbe, veze, cards] = await Promise.all([
      vjezbaService.getAll(),
      vjezbaPolaznikService.getAll(),
      cardService.getAll(),
    ]);
    return vjezbe.map((vjezba) => ({
      ...vjezba,
      brojPolaznika: veze.filter((veza) => veza.vjezbaId === vjezba.id).length,
      brojKartica: cards.filter((card) => card.vjezbaId === vjezba.id).length,
    }));
  });

  async function removeVjezba(id) {
    try {
      await vjezbaService.remove(id);
      setData((current) => current.filter((vjezba) => vjezba.id !== id));
      setError("");
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return { vjezbe: data ?? [], loading, error, removeVjezba };
}

// Samo popis vjezbi, za izbornik na kartici i naziv vjezbe uz karticu.
export function useVjezbaOptions() {
  const { data, loading, error } = useLoad(vjezbaService.getAll);
  return { vjezbe: data ?? [], loading, error };
}

// Jedna vjezba sa svime sto forma treba: svi polaznici (za odabir), odabrani
// polaznici i kartice te vjezbe. Bez id-a je to nova vjezba.
export function useVjezba(vjezbaId) {
  const { data, loading, error } = useLoad(async () => {
    const [vjezba, polaznici, veze, cards] = await Promise.all([
      vjezbaId ? vjezbaService.getById(vjezbaId) : null,
      polaznikService.getAll(),
      vjezbaId ? vjezbaPolaznikService.getByVjezba(vjezbaId) : [],
      vjezbaId ? cardService.getByVjezba(vjezbaId) : [],
    ]);
    return {
      vjezba,
      polaznici,
      polaznikIds: veze.map((veza) => veza.polaznikId),
      cards,
    };
  });

  async function save(form, polaznikIds) {
    const saved = await vjezbaService.save(form, data?.vjezba?.id, polaznikIds);
    if (!saved) throw new Error("This exercise no longer exists.");
    return saved;
  }

  return {
    vjezba: data?.vjezba ?? null,
    polaznici: data?.polaznici ?? [],
    polaznikIds: data?.polaznikIds ?? [],
    cards: data?.cards ?? [],
    loading,
    error,
    save,
  };
}
