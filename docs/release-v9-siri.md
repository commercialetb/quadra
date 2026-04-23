# Release v9 Siri

Questa release aggiunge una review queue reale per le ambiguità Siri.

## Cosa cambia
- `shortcut_review_queue` nel layer Supabase
- persistenza di ambiguità e record mancanti
- risoluzione manuale da UI con esecuzione reale dell'azione
- best guess automatico sul record più probabile

## Rotte nuove
- `GET /api/shortcut/review-queue`
- `POST /api/shortcut/resolve-review`

## UI nuova
- `/capture/siri/review`

## Flusso
1. Siri invia azione.
2. Se il match è sicuro, Quadra esegue.
3. Se il match è ambiguo o mancante, Quadra salva una review.
4. L'utente entra in review, seleziona il record corretto e Quadra completa l'azione.
