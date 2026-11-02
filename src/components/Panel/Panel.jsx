// Okvir oko jedne cjeline na zaslonu. Naslov je h2, jer je h1 naslov zaslona.

import stil from "../../styles/screens.module.css";

export default function Panel({ title, children, className = "" }) {
  return (
    <section className={`${stil.panel} ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </section>
  );
}
