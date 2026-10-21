# Koledar apartmaja

Preprosta spletna stran za domače »rezervacije« apartmaja: letni koledar, v katerem za vsak obisk
vpišeš prihod, odhod in kdo je bil prisoten. Zasedeni dnevi se pobarvajo, ob strani pa je letni
pregled: kdo je bil kolikokrat in koliko noči.

Stran teče na **Cloudflare Pages**, vpisi se shranjujejo v bazo **Cloudflare D1**. Oboje je v
brezplačnem paketu.

```
apartma-koledar/
├── public/index.html              # celotna stran (HTML, CSS, JS)
└── functions/                     # strežniški del (Cloudflare Pages Functions)
    ├── _shared/stay.js            # preverjanje vpisov
    └── api/
        ├── _middleware.js         # preverjanje PIN-a in ustvarjanje tabele
        └── stays/
            ├── index.js           # GET /api/stays, POST /api/stays
            └── [id].js            # PUT /api/stays/:id, DELETE /api/stays/:id
```

## Postavitev na Cloudflare

### 1. Ustvari bazo D1

V nadzorni plošči Cloudflare odpri **Storage & Databases → D1 SQL Database → Create** in
ustvari bazo, npr. `apartma`. Tabele ni treba ustvarjati, stran jo ustvari sama ob prvem obisku.

### 2. Ustvari projekt Pages

**Workers & Pages → Create → Pages → Connect to Git** in izberi ta repozitorij in vejo.
Nastavitve gradnje:

| Nastavitev               | Vrednost          |
| ------------------------ | ----------------- |
| Framework preset         | None              |
| Build command            | *(prazno)*        |
| Build output directory   | `public`          |
| Root directory           | `apartma-koledar` |

Opomba: ročni »drag & drop« upload v nadzorni plošči ne podpira mape `functions`, zato uporabi
povezavo z Gitom ali ukazno vrstico (spodaj).

### 3. Poveži bazo in nastavi PIN

V projektu odpri **Settings**:

- **Bindings → Add → D1 database**: ime spremenljivke `DB`, izberi bazo `apartma`.
- **Variables and Secrets → Add**: tip *Secret*, ime `PIN`, vrednost npr. `4821`.
  Brez PIN-a lahko koledar bere in ureja vsak, ki pozna naslov.

Nato pod **Deployments** ponovno zaženi zadnjo postavitev, da se nastavitve upoštevajo.

PIN vsak član družine vpiše enkrat, naprava si ga zapomni.

### Postavitev iz ukazne vrstice (namesto Gita)

```bash
cd apartma-koledar
npx wrangler login
npx wrangler pages deploy public --project-name apartma-koledar
```

Ukaz mora teči iz mape `apartma-koledar`, da wrangler najde mapo `functions`. Bazo in PIN nato
povežeš kot v koraku 3.

## Zaščita z e-pošto namesto PIN-a (neobvezno)

Če želiš prijavo z e-poštnim naslovom, vklopi **Cloudflare Access** (Zero Trust, brezplačno do
50 uporabnikov) za domeno strani in dovoli naslove družine. V tem primeru PIN lahko izpustiš.

## Lokalni zagon

```bash
cd apartma-koledar
npx wrangler pages dev public --d1 DB=apartma --binding PIN=1234
```

Stran je nato na `http://localhost:8788`.

## Varnostna kopija

Gumb **Prenesi varnostno kopijo (JSON)** pod seznamom vpisov prenese vse vpise v datoteko.
