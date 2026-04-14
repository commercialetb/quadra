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
