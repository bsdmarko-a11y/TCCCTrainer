// Zaglavlje zaslona: jedan h1 po zaslonu, iznad njega nadnaslov,
// ispod opis. Djeca idu desno od naslova (npr. gumb "Nova").

import stil from "./ScreenHeader.module.css";

export default function ScreenHeader({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <header className={stil.zaglavlje}>
      {eyebrow && <p className={`caption ${stil.nadnaslov}`}>{eyebrow}</p>}
      <div className={stil.red}>
        <h1 className="screen-title">{title}</h1>
        {children}
      </div>
      {description && <p className={`small ${stil.opis}`}>{description}</p>}
    </header>
  );
}
