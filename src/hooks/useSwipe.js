// Vodoravni prelazak prstom preko kartice, za listanje koraka.
//
// Dva pravila drze okomito listanje netaknutim:
//   - nikad se ne zove preventDefault, pa stranica normalno klizi
//   - gesta se priznaje tek ako je vodoravni pomak odlucujuce veci od okomitog
// Tipkovnica radi isto, jer gesta ne smije biti jedini nacin kretanja.

import { useEffect } from "react";

const PRAG = 60; // px koje prst mora prijeci
const OMJER = 1.5; // koliko puta vodoravno mora nadmasiti okomito

export default function useSwipe(ref, { onLeft, onRight } = {}) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function pocetak(event) {
      // Samo dodir i olovka; mis ne lista.
      if (event.pointerType === "mouse") return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    }

    function kraj(event) {
      if (!tracking) return;
      tracking = false;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) < PRAG) return;
      if (Math.abs(dx) < Math.abs(dy) * OMJER) return;

      if (dx < 0) onLeft?.();
      else onRight?.();
    }

    function prekid() {
      tracking = false;
    }

    element.addEventListener("pointerdown", pocetak);
    element.addEventListener("pointerup", kraj);
    element.addEventListener("pointercancel", prekid);

    return () => {
      element.removeEventListener("pointerdown", pocetak);
      element.removeEventListener("pointerup", kraj);
      element.removeEventListener("pointercancel", prekid);
    };
  }, [ref, onLeft, onRight]);
}

export function useArrowKeys({ onLeft, onRight }) {
  useEffect(() => {
    function tipka(event) {
      // Ne otimaj strelice poljima za unos.
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") onLeft?.();
      if (event.key === "ArrowRight") onRight?.();
    }

    window.addEventListener("keydown", tipka);
    return () => window.removeEventListener("keydown", tipka);
  }, [onLeft, onRight]);
}
