// Logika zaslona polaznika, odvojena od prikaza.

import * as polaznikService from "../services/polaznikService.js";
import * as vjezbaPolaznikService from "../services/vjezbaPolaznikService.js";
import useLoad from "./useLoad.js";

// Popis polaznika s brojem vjezbi u kojima svaki sudjeluje.
export function usePolaznici() {
  const { data, loading, error, setData, setError } = useLoad(async () => {
    const [polaznici, veze] = await Promise.all([
      polaznikService.getAll(),
      vjezbaPolaznikService.getAll(),
    ]);
    return polaznici.map((polaznik) => ({
      ...polaznik,
      brojVjezbi: veze.filter((veza) => veza.polaznikId === polaznik.id).length,
    }));
  });

  async function removePolaznik(id) {
    try {
      await polaznikService.remove(id);
      setData((current) => current.filter((polaznik) => polaznik.id !== id));
      setError("");
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return { polaznici: data ?? [], loading, error, removePolaznik };
}

// Jedan polaznik i vjezbe u kojima sudjeluje. Bez id-a je to novi polaznik.
export function usePolaznik(polaznikId) {
  const { data, loading, error } = useLoad(async () => {
    const [polaznik, vjezbe] = await Promise.all([
      polaznikId ? polaznikService.getById(polaznikId) : null,
      polaznikId ? polaznikService.getVjezbe(polaznikId) : [],
    ]);
    return { polaznik, vjezbe };
  });

  async function save(form) {
    const saved = await polaznikService.save(form, data?.polaznik?.id);
    if (!saved) throw new Error("This trainee no longer exists.");
    return saved;
  }

  return {
    polaznik: data?.polaznik ?? null,
    vjezbe: data?.vjezbe ?? [],
    loading,
    error,
    save,
  };
}
