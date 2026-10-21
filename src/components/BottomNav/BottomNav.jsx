// Donja navigacija: pet odredista, ista na svakom zaslonu.
//
// NavLink sam racuna je li stavka aktivna iz trenutne putanje, pa podruta
// (/march/airway, /kartica/nova) drzi svoj odjeljak upaljenim. Samo pocetna
// koristi "end", inace bi "/" bila aktivna na svakoj putanji.

import { NavLink } from "react-router-dom";

import Icon from "../icons/index.jsx";
import { NAV_ITEMS, RouteNames } from "../../lib/constants.js";
import stil from "./BottomNav.module.css";

export default function BottomNav({ items = NAV_ITEMS }) {
  return (
    <nav aria-label="Main" className={stil.navigacija}>
      <ul className={stil.popis}>
        {items.map((item) => (
          <li className={stil.stavka} key={item.to}>
            <NavLink
              className={({ isActive }) =>
                isActive ? `${stil.veza} ${stil.aktivna}` : stil.veza
              }
              end={item.to === RouteNames.HOME}
              to={item.to}
            >
              <span className={stil.ikona}>
                <Icon name={item.icon} />
              </span>
              <span className={stil.oznaka}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
