// Ispis kartice.
//
// Preglednik imenuje spremljeni PDF po naslovu dokumenta, pa se naslov na
// trenutak zamijeni imenom kartice i vrati nakon dijaloga. Zato ovo zivi
// izvan komponente: mijenjanje document.title nije posao prikaza.

export function printCard(trainingId) {
  const naziv = String(trainingId || "blank")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const prijasnji = document.title;
  document.title = `TCCC-card-${naziv || "blank"}`;

  try {
    window.print();
  } finally {
    // Dijalog je modalan, ali neki preglednici se vracaju odmah.
    window.setTimeout(() => {
      document.title = prijasnji;
    }, 1000);
  }
}
