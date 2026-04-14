# Quadra Apple Shortcuts v5

La v5 rende il layer Siri molto piu vicino all'uso reale.

## Cosa cambia

- risposte piu naturali in `spokenResponse`
- deep link `openUrl` nei payload risposta
- ricerca record con `resolution` (`resolved`, `ambiguous`, `missing`)
- agenda di oggi con `highPriorityCount`
- aggiunta nota anche partendo da `query`, non solo da `entityId`

## Pattern consigliato in Apple Shortcuts

1. Dettatura o input testuale
2. `Ottieni contenuti di URL`
3. Leggi `spokenResponse`
4. Se esiste `openUrl`, esegui `Apri URL`

## Endpoint principali

- `POST /api/shortcut/process-voice-note`
- `POST /api/shortcut/search-record`
- `POST /api/shortcut/today-agenda`
- `POST /api/shortcut/add-note`

## Campi utili

### create follow-up
- `spokenResponse`
- `openUrl`
- `followupsUrl`
- `needsConfirmation`

### search record
- `spokenResponse`
- `resolution`
- `openUrl`
- `topResult`

### today agenda
- `spokenSummary`
- `highPriorityCount`
- `openUrl`

### add note
- `spokenResponse`
- `openUrl`
- `needsConfirmation`
- `results`
