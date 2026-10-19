// Korak 1: samo ljuska i provjera da tokeni, fontovi i teme rade.
// Korak 2 ovdje zamjenjuje sadrzaj s rutama i donjom navigacijom.

import { useState } from "react";

import march from "./data/march.json";
import questions from "./data/questions.json";
import scenarios from "./data/scenarios.json";
import { THEMES } from "./lib/constants.js";
import stil from "./App.module.css";

export default function App() {
  const [tema, postaviTemu] = useState(THEMES.DARK);

  function promijeniTemu() {
    const nova = tema === THEMES.DARK ? THEMES.NIGHT : THEMES.DARK;
    postaviTemu(nova);
    document.documentElement.setAttribute("data-theme", nova);
  }

  return (
    <div className="ljuska">
      <main className="sadrzaj">
        <header className={stil.zaglavlje}>
          <p className={`caption ${stil.nadnaslov}`}>Training only</p>
          <h1 className="screen-title">TCCC Trainer</h1>
          <p className="small">
            Not for use on a real casualty. No patient data is stored.
          </p>
        </header>

        <section className={stil.kartica} aria-labelledby="postavljanje">
          <h2 className="section-title" id="postavljanje">
            Korak 1 gotov
          </h2>
          <ul className={stil.popis}>
            <li>
              Tokeni: <code>design/tokens.json</code> &rarr;{" "}
              <code>src/styles/variables.css</code>
            </li>
            <li>Teme: dark, night, print</li>
            <li>
              Sadrzaj: {march.steps.length} MARCH-PAWS koraka,{" "}
              {questions.questions.length} pitanja, {scenarios.scenarios.length}{" "}
              scenarija
            </li>
          </ul>
        </section>

        <section className={stil.kartica} aria-labelledby="tema">
          <h2 className="section-title" id="tema">
            Tema
          </h2>
          <p className="small">
            Trenutno: <strong>{tema}</strong>. Nocna tema je crvena zbog
            discipline svjetla.
          </p>
          <button className={stil.gumb} type="button" onClick={promijeniTemu}>
            Prebaci na {tema === THEMES.DARK ? "night" : "dark"}
          </button>
        </section>

        <p className={`caption ${stil.podnozje}`}>
          Sljedece: Korak 2 - rute i donja navigacija
        </p>
      </main>
    </div>
  );
}
