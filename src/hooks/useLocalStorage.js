// Jedino mjesto koje dira window.localStorage.
//
// Citanje i pisanje su u try/catch: privatni prozor ili puna kvota ne smiju
// srusiti zaslon, nego vratiti poruku koju zaslon moze prikazati.

import { useRef, useState } from "react";

const STORAGE_ERROR =
  "Saved data could not be accessed. Your changes may not persist in this browser.";

export default function useStoredState(key, initialValue) {
  const [initial] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return {
        value: saved === null ? initialValue : JSON.parse(saved),
        error: "",
      };
    } catch (error) {
      console.error(`Could not read ${key} from local storage.`, error);
      return { value: initialValue, error: STORAGE_ERROR };
    }
  });

  const [value, setValue] = useState(initial.value);
  const valueRef = useRef(value);
  const [error, setError] = useState(initial.error);

  function updateValue(nextValue) {
    const next =
      typeof nextValue === "function" ? nextValue(valueRef.current) : nextValue;
    valueRef.current = next;
    setValue(next);

    try {
      window.localStorage.setItem(key, JSON.stringify(next));
      setError("");
    } catch (storageError) {
      console.error(`Could not save ${key} to local storage.`, storageError);
      setError(STORAGE_ERROR);
    }
  }

  return [value, updateValue, error];
}
