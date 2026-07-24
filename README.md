# Angular Academy — interaktív interjú-felkészülő

Statikus tanulóoldal Angular interjúra: **166 kérdés és bővebb válasz** 20 topicra bontva, valós kódrészletekkel és egy böngészhető példaalkalmazással. Nincs build lépés — tiszta HTML/CSS/JS, mobilbarát.

## Funkciók

- **166 kérdés** junior / medior / senior szinteken, 20 topicban
- **Bővebb, több mondatos válaszok** + példakód a legtöbb kérdéshez
- **Topic-navigáció** (oldalsáv desktopon, legördülő mobilon)
- **Kereső** kérdésekben, válaszokban és kódban
- **Szint-szűrő** (junior/medior/senior)
- **Haladáskövetés** — jelöld be, amit tudsz; a böngésződ elmenti (localStorage)
- **Példaalkalmazás böngésző** — 14 fájlos működő Angular 18 mini-app, fájlonként leírással és a bemutatott fogalmakkal
- **A kérdésekből linkek** vezetnek a példaalkalmazás megfelelő fájljához
- **Sötét / világos mód**

## Kipróbálás helyben

Mivel az oldal `fetch`-csel tölti be az adatokat, egy egyszerű helyi szerver kell (a `file://` megnyitás nem elég):

```bash
# Python
python3 -m http.server 8000
# vagy Node
npx serve
```

Aztán nyisd meg: http://localhost:8000

## Feltöltés GitHub Pages-re

1. Hozz létre egy új repository-t a GitHubon (pl. `angular-academy`).
2. Töltsd fel ennek a mappának a **teljes tartalmát** a repo gyökerébe:
   - `index.html`
   - `assets/` (app.js)
   - `data/` (questions.json, appcode.json)
   - `.nojekyll`
   - `README.md`

   Parancssorból:
   ```bash
   git init
   git add .
   git commit -m "Angular Academy tanulóoldal"
   git branch -M main
   git remote add origin https://github.com/FELHASZNALONEV/angular-academy.git
   git push -u origin main
   ```
3. A repo oldalán: **Settings → Pages**.
4. A *Source* alatt válaszd: **Deploy from a branch**, branch: **main**, mappa: **/ (root)**. Mentés.
5. 1-2 perc múlva az oldal elérhető lesz itt:
   `https://FELHASZNALONEV.github.io/angular-academy/`

A `.nojekyll` fájl fontos: enélkül a GitHub Pages a Jekyll-motorral dolgozná fel a fájlokat, ami néha kihagy mappákat.

## Szerkezet

```
angular-academy/
├── index.html            # az oldal (HTML + CSS)
├── assets/
│   └── app.js            # logika: renderelés, kereső, szűrők, haladás
├── data/
│   ├── questions.json    # 166 kérdés + válasz + kód
│   └── appcode.json      # a példaalkalmazás forrásfájljai
├── .nojekyll
└── README.md
```

## Testreszabás

- **Új kérdés**: vedd fel a `data/questions.json` `questions` tömbjébe (mezők: `id`, `topic`, `level`, `q`, `a`, `code`, `appFile`, `tags`).
- **Új topic**: add hozzá a `meta.topics` listához, és használd az `id`-ját a kérdéseknél.

Jó tanulást és sok sikert az interjún!
