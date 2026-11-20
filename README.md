# TCCC Trainer

Mobilna web-aplikacija za vježbu TCCC-a (Tactical Combat Casualty Care).
**Samo za obuku** – ne sprema podatke o stvarnim pacijentima i ne koristi se na
stvarnom unesrećenom.

Završni rad programa Front-End developer (Edunova).

- Repozitorij: https://github.com/bsdmarko-a11y/TCCCTrainer
- Objavljena aplikacija: _adresu upisati nakon objave_ (`edunovaX.reginaosijek.hr`)

## Što aplikacija radi

| Zaslon | Putanja | Opis |
| --- | --- | --- |
| Početna | `/` | Ulaz u sve načine rada |
| Vodič | `/march`, `/march/:stepId` | MARCH-PAWS koraci, listanje prstom i strelicama |
| Kviz | `/quiz`, `/quiz/pregled` | Pitanja s odbrojavanjem i pregled pogrešaka |
| Scenariji | `/scenario`, `/scenario/:scenarioId` | Odabir postupaka pravim redoslijedom, s bodovanjem |
| Mjerač poveza | `/tq` | Vrijeme od postavljanja poveza, upozorenje nakon 60 s |
| Kartice | `/kartica`, `/kartica/nova`, `/kartica/:cardId`, `/kartica/:cardId/ispis` | Unos, izmjena, brisanje i ispis kartice unesrećenog (DD1380) |
| Vježbe | `/vjezbe`, `/vjezbe/nova`, `/vjezbe/:vjezbaId` | Unos, izmjena i brisanje vježbi, odabir polaznika, popis kartica vježbe |
| Polaznici | `/polaznici`, `/polaznici/novi`, `/polaznici/:polaznikId` | Unos, izmjena i brisanje polaznika, popis njegovih vježbi |
| Napredak | `/napredak` | Spremljeni rezultati kviza i scenarija |

## Tehnologije

Vite, React 19 (funkcijske komponente i hookovi), React Router 7, JavaScript
ES6+, CSS moduli s varijablama iz dizajnerskih tokena, json-server kao
simulacija poslužitelja, PWA (rad bez mreže).

## Pokretanje

```
npm install
npm run dev        # aplikacija na http://localhost:5173, podaci u localStorageu
```

S poslužiteljem (json-server), u dva terminala:

```
npm run server     # REST API na http://localhost:3001, podaci u db.json
npm run dev:api    # aplikacija koja kartice čita i sprema preko API-ja
```

Ostale naredbe:

```
npm run build      # generira tokene pa gradi u dist/
npm run preview    # lokalni pregled izgrađene aplikacije
npm run lint       # oxlint
npm run tokens     # design/tokens.json -> src/styles/variables.css
```

## Struktura

```
db.json                 podaci za json-server (cards, vjezbe, polaznici,
                        vjezbaPolaznik)
.env.api                postavke načina rada "api"
design/tokens.json      izvor istine za boje, tipografiju, razmake
scripts/                generator CSS varijabli iz tokena
public/                 ikone, .htaccess i _redirects za objavu
src/
  App.jsx               rute i okvir aplikacije
  pages/                po jedan zaslon (logika zaslona)
  components/           prezentacijske komponente za višekratnu upotrebu
                        (BottomNav, Panel, ProgressBar, ScreenHeader, Timer,
                        Loading, FormField, CheckboxGroup, StorageWarning,
                        UpdatePrompt, icons)
  hooks/                useLoad, useCards, useVjezbe, usePolaznici (dohvat
                        podataka), useLocalStorage, useSwipe
  services/             pristup podacima (vidi niže)
  data/                 sadržaj: march, questions, scenarios, casualty-card
  lib/                  constants (putanje, ključevi), validation, scoring,
                        formatTime, alerts, print
  styles/               variables.css (generirano), global.css, screens.module.css
```

## Podaci i servisni sloj

Zasloni ne znaju odakle podaci dolaze. Kartice, vježbe i polaznici idu istim
putem:

```
zaslon (pages/...)
  -> hook (useCards, useVjezbe, usePolaznici)   dohvat u useEffect, stanje
                                                učitavanja i greške
    -> servis entiteta (cardService, vjezbaService, polaznikService,
       vjezbaPolaznikService)
      -> services/collection.js                 bira izvor zbirke
        -> collection.local.js                  localStorage (storage.js)
        -> collection.api.js                    json-server (http.js, fetch)
```

Izvor se bira varijablom okoline `VITE_DATA_SOURCE`:

- `local` (zadano) – localStorage. Tako radi i objavljena aplikacija, jer
  statički poslužitelj nema API.
- `api` – json-server na adresi `VITE_API_URL`. Uključuje se s
  `npm run dev:api`, koji čita `.env.api`.

Oba izvora imaju isto, asinkrono sučelje, pa se zamjena pravim poslužiteljem
svodi na promjenu jedne datoteke.

json-server mijenja `db.json` dok radi. Te promjene su podaci za vježbu i ne
treba ih commitati.

### Model podataka

```
vjezbe          { id, naziv, datum, lokacija, napomena }
polaznici       { id, pozivniZnak, uloga }
vjezbaPolaznik  { id, vjezbaId, polaznikId }
cards           { id, vjezbaId, trainingId, ... }
```

- **Vježba 1:n kartice.** Kartica sprema `vjezbaId`; u formi kartice vježba se
  bira iz izbornika. Zaslon vježbe prikazuje njezine kartice.
- **Vježba n:n polaznici.** Parove drži vezna zbirka `vjezbaPolaznik`. U formi
  vježbe polaznici se biraju kvačicama, a zaslon polaznika prikazuje vježbe u
  kojima sudjeluje.
- Vježba koja ima kartice ne može se obrisati. Brisanjem vježbe ili polaznika
  brišu se i njihovi parovi u veznoj zbirci.
- Polaznik se vodi pod pozivnim znakom; pravo ime se nigdje ne sprema.

Forme vježbe i polaznika provjeravaju svako polje (`lib/validation.js`) i
poruku prikazuju uz polje, nakon napuštanja polja ili pokušaja spremanja.

Rezultati kviza i scenarija, tema i mjerač poveza spremaju se u localStorage
preko hooka `useLocalStorage`.

## Tokeni i teme

Boje se ne pišu ručno. Sve dolazi iz `design/tokens.json`, a `npm run tokens`
iz njega generira `src/styles/variables.css`. Tema se postavlja atributom na
`<html data-theme="...">`:

- `dark` – zadana
- `night` – crvena, za disciplinu svjetla
- `print` – bijela podloga, za ispis kartice

Dizajnerski sustav s pravilima i komponentama:
https://claude.ai/artifact/GeVYoRgijTHKAfJMQeV5SA

## Objava

```
npm install
npm run build
```

Na poslužitelj se prenosi **sadržaj** mape `dist/` (ne sama mapa), u korijen
poddomene.

Aplikacija je jednostranična: putanje poput `/kartica/123/ispis` zna samo
React Router, pa poslužitelj svaku nepoznatu putanju mora poslužiti kao
`index.html`. Za to su u `public/` pripremljena pravila koja se kopiraju u
`dist/`:

- `.htaccess` – Apache
- `_redirects` – Netlify (`netlify.toml` i `vercel.json` rade isto za te usluge)

Ako poslužitelj nije nijedan od tih, treba mu zadati isto pravilo. Bez njega
osvježavanje stranice na podputanji vraća 404.

`sw.js` se šalje s `Cache-Control: no-cache`, inače preglednik drži staru
verziju servisnog radnika i nova objava ne stigne do uređaja.

### Provjera nakon objave

1. Otvori `/kartica` i osvježi stranicu – ne smije biti 404.
2. Stvori karticu, osvježi – kartica je i dalje na popisu.
3. DevTools, Application, Service Workers – radnik je `activated`.
4. Network, uključi **Offline**, osvježi – aplikacija se i dalje učitava.

## Što još nije napravljeno

- Validacija svakog polja na kartici unesrećenog (forme vježbe i polaznika
  je već imaju).
- SCSS s varijablama i mixinima umjesto običnih CSS modula.
- Poruke uspjeha (toast) i vlastiti dijalog potvrde brisanja.
