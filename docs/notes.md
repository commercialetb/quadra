# Quadra - sequenza operativa consigliata

## 1. Supabase
1. Crea un progetto Supabase.
2. Vai in SQL Editor.
3. Esegui `quadra_supabase_schema.sql`.
4. Vai in Authentication > Providers e attiva Email.
5. Fai un primo login dalla app oppure crea un utente test.
6. Verifica che la tabella `profiles` contenga il tuo utente.

## 2. Seed demo
1. Apri `quadra_seed_demo.sql`.
2. Esegui lo script per creare la funzione `seed_quadra_demo`.
3. Recupera il tuo `profiles.id`.
4. Esegui:
   `select seed_quadra_demo('IL-TUO-UUID');`
5. Controlla che in dashboard compaiano aziende, contatti, opportunita e follow-up.

## 3. Frontend base
1. Scompatta `quadra-next-supabase.zip`.
2. Copia `.env.example` in `.env.local`.
3. Inserisci:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Installa dipendenze con `npm install`.
5. Avvia con `npm run dev`.

## 4. Patch CRUD
1. Scompatta `quadra-crud-patch.zip`.
2. Copia i file sopra al progetto Next esistente, sovrascrivendo quando richiesto.
3. Riavvia `npm run dev`.
4. Testa:
   - creazione azienda
   - creazione contatto
   - creazione opportunita
   - creazione follow-up
   - update rapido di stato/fase
   - eliminazione record

## 5. Config auth
1. In Supabase vai su Authentication > URL Configuration.
2. Aggiungi:
   - `http://localhost:3000/auth/callback`
3. Quando andrai su Vercel, aggiungi anche il dominio di produzione.

## 6. Deploy Vercel
1. Carica il repo su GitHub.
2. Importa su Vercel.
3. Aggiungi le stesse env di Supabase.
4. Aggiungi in Supabase il redirect di produzione.
5. Testa login e CRUD in produzione.

## 7. Dopo che tutto funziona bene
1. Detail pages per azienda, contatto, opportunita.
2. Timeline attivita.
3. Note.
5. Dashboard proattiva.
6. Solo dopo: AI e Siri.

## Ordine giusto dei test
1. login
2. lettura dati
3. create
4. update
5. delete
6. deploy
7. mobile refinement
8. automazioni
