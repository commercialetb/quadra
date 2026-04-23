# Quadra Apple Shortcuts v4

Questa versione aggiunge un vero kit di integrazione per Siri / Comandi Rapidi.

## Cosa c'e di nuovo

- endpoint `GET /api/shortcut/manifest`
- pagina installazione `/capture/siri/install`
- payload JSON esempio in `public/shortcuts/`
- 4 azioni pronte:
  - crea follow-up
  - cerca record
  - mostra oggi
  - aggiungi nota

## Flusso consigliato

1. in iPhone apri Comandi Rapidi
2. crea un nuovo comando
3. aggiungi `Detta testo` o `Testo`
4. aggiungi `Ottieni contenuti di URL`
5. usa uno degli endpoint del manifest
6. leggi `spokenResponse` o `spokenSummary`
7. opzionalmente apri Quadra su `/capture/siri`

## Endpoint manifest

`GET /api/shortcut/manifest`

Restituisce tutte le azioni con:
- titolo
- frase Siri consigliata
- endpoint completo
- body esempio
- campi risposta

## File utili

- `/public/shortcuts/create-followup.json`
- `/public/shortcuts/search-record.json`
- `/public/shortcuts/today-agenda.json`
- `/public/shortcuts/add-note.json`

Sono template da copiare in uno shortcut reale.
