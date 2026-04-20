# Quadra CRM

Quadra e una web app CRM basata su Next.js 15, Supabase e un layer AI orientato a follow-up, note e gestione opportunita. Questa versione e ripulita per un deploy produzione senza modulo `projects`.

## Stack
- Next.js 15 + App Router
- React 19
- TypeScript strict
- Supabase Auth + Postgres
- AI routing con Groq e fallback OpenAI
- Siri / Apple Shortcuts per cattura rapida follow-up

## Avvio locale
1. Copia `.env.example` in `.env.local`
2. Installa le dipendenze: `npm install`
3. Applica gli script SQL in `supabase/` sul tuo progetto Supabase
4. Avvia: `npm run dev`

## Variabili ambiente minime
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SHORTCUT_SHARED_TOKEN`
- almeno una tra `GROQ_API_KEY` e `OPENAI_API_KEY`

## Script utili
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run check`

## Deploy
Per una checklist sintetica vedi `docs/production-notes.md`.

## Voce e Siri
La scelta consigliata e usare Siri / Apple Shortcuts come trigger esterno e Quadra come motore operativo per parsing, conferma e creazione follow-up. La pagina interna di cattura vocale resta utile quando l'utente e gia dentro l'app.


## Responsive v2 clean pass

Questa versione include un layer finale `src/app/v2-clean.css` con override mirati per:
- dashboard su iPhone portrait e landscape
- topbar iPad portrait
- rail desktop più stabile
- detail page a colonna singola su tablet
- dock mobile meno invasivo

Nota: il file esiste per evitare di continuare a stratificare fix dentro `globals.css` senza una chiusura leggibile del pass responsive.


## Responsive v3 clean
- Stabilizzazione finale per iPhone portrait/landscape, iPad portrait e desktop compatti.
- KPI dashboard in colonna su schermi stretti per evitare overlap.
- Topbar mobile/tablet più compatta e consistente.
- Priority grid desktop più leggibile con badge che non schiacciano il testo.

- v4 clean: rifinitura desktop/iPad con sidebar più leggera, promo voice nascosta sulle viste larghe e KPI valuta stabilizzati su una sola riga.


## v5 clean
- consolidato il layer responsive finale in `src/app/v5-clean.css`
- rimosso l'import a cascata di `v2/v3/v4` dal layout
- rifiniti sidebar, KPI dashboard, topbar iPhone/iPad e spacing desktop


## v6 clean
- ridotto lo spazio vuoto sopra su iPad portrait e iPhone portrait/landscape
- drawer tablet forzato fuori dal flusso del layout
- topbar e ambient shell riallineati in alto


## v19 cleanup finale

Questa build aggiunge solo un layer conservativo di pulizia finale:
- rifinitura visiva per Analisi, score e priorita
- griglie e card piu coerenti tra desktop, iPad e mobile
- spaziatura piu ordinata in Settings e nei pannelli operativi

Obiettivo: consolidare, non rifare.
