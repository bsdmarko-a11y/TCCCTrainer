# TCCC Trainer

Mobilna aplikacija za vjezbu TCCC-a. **Samo za obuku** - ne sprema podatke o
stvarnim pacijentima i ne koristi se na stvarnom unesrecenom.

Vite + React 19, obicni JavaScript, CSS moduli, bez TypeScripta.

## Naredbe

```
npm install
npm run dev       # razvojni posluzitelj na http://localhost:5173
npm run tokens    # design/tokens.json -> src/styles/variables.css
npm run build     # pokrece tokens pa gradi u dist/
npm run lint      # oxlint
npm run preview
```

## Struktura

```
design/tokens.json     izvor istine za boje, tipografiju, razmake, radijuse
scripts/               generator varijabli iz tokena
public/icons/          ikone aplikacije
src/
  components/          dijeljene komponente (Korak 2 nadalje)
  pages/               po jedan zaslon
  data/                march.json, questions.json, scenarios.json, casualty-card.json
  hooks/               useLocalStorage, useTimer, useCountdown, useTheme
  lib/                 constants.js (RouteNames, STORAGE_KEYS), scoring, formatTime
  styles/              variables.css (generirano), global.css
```

## Tokeni i teme

Boje se nikad ne pisu rucno. Sve dolazi iz `design/tokens.json`, a
`npm run tokens` iz njega generira `src/styles/variables.css`. Tema se postavlja
jednom, atributom na `<html data-theme="...">`:

- `dark` - zadana, Iqarus narancasta na sivoj izvedenoj iz znaka
- `night` - crvena, za disciplinu svjetla
- `print` - bijela podloga, samo za ispis kartice

Dizajnerski sustav s pravilima i komponentama:
https://claude.ai/artifact/GeVYoRgijTHKAfJMQeV5SA

## Redoslijed izrade

1. ~~Postavljanje projekta i struktura mapa~~
2. ~~Rute i donja navigacija~~
3. ~~Kviz~~
4. ~~MARCH-PAWS vodic~~
5. ~~Mjerac vremena za poveze (TQ)~~
6. ~~Scenariji~~
7. ~~Kartica unesrecenog~~
8. ~~Napredak~~
9. ~~PWA i rad bez mreze~~
10. Objava (Netlify ili Vercel)

## Objava

Aplikacija je u mapi `iqarus/` unutar repozitorija, pa objavi treba reci gdje
je korijen projekta.

**Netlify** - New site from Git, odaberi `bsdmarko-a11y/IQARUS`, pa u
postavkama **Base directory = `iqarus`**. Ostalo (naredba, izlazna mapa,
zamjena putanja, zaglavlja) cita se iz `netlify.toml`.

**Vercel** - Add New Project, isti repozitorij, **Root Directory = `iqarus`**.
Ostalo je u `vercel.json`.

Obje postavke rade istu bitnu stvar: svaka putanja se poslužuje kao
`index.html`. Bez toga osvjezavanje na `/kartica/123/ispis` vraca 404, jer ta
datoteka na posluzitelju ne postoji - rutu zna samo React Router.

`sw.js` se salje s `Cache-Control: no-cache`, inace bi preglednik drzao staru
verziju radnika i nova objava nikad ne bi stigla do uredjaja.

### Provjera nakon prve objave

PWA treba HTTPS, sto obje usluge daju. Na pravoj adresi provjeri:

1. DevTools, Application, Service Workers - radnik je `activated`.
2. Network, ukljuci **Offline**, pa osvjezi - aplikacija se i dalje ucitava.
3. Na telefonu: Add to Home Screen, pa pokreni u zrakoplovnom nacinu.
