# Quadra Siri Shortcuts v1

Questa release aggiunge un layer Siri operativo lato Quadra, pronto per essere collegato a Apple Shortcuts.

## Endpoint disponibili

Tutti gli endpoint accettano:
- sessione autenticata dell'app Quadra
- oppure header `x-shortcut-token` / `x-quadra-shortcut-token`
- oppure body `shortcutToken`

### 1. Crea follow-up
`POST /api/shortcut/process-voice-note`

Body minimo:
```json
{ "note": "Richiamare Mario Rossi domani per la demo" }
```

### 2. Cerca record
`POST /api/shortcut/search-record`

Body minimo:
```json
{ "query": "Rossi" }
```

### 3. Mostra agenda di oggi
`POST /api/shortcut/today-agenda`

Body minimo:
```json
{}
```

### 4. Aggiungi nota
`POST /api/shortcut/add-note`

Body minimo:
```json
{
  "entityType": "contact",
  "entityId": "UUID_RECORD",
  "title": "Nota da Siri",
  "body": "Interessato, richiamare con nuova proposta"
}
```

## Pagina di test

Apri:
- `/capture/siri`

Da qui puoi testare tutte le azioni Siri senza dover costruire ancora i comandi Apple.

## Flusso consigliato per Apple Shortcuts

1. Siri raccoglie la frase
2. Shortcut chiama l'endpoint Quadra giusto
3. Quadra risponde con `spokenResponse`
4. Lo shortcut legge la risposta o apre la pagina corretta nell'app

## Azioni da implementare in iOS successivamente

- Crea follow-up in Quadra
- Cerca in Quadra
- Mostra oggi in Quadra
- Aggiungi nota in Quadra
