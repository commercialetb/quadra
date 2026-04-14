# Apple Shortcuts v8

Novità v8:
- endpoint `POST /api/shortcut/log-interaction`
- aggiornamento automatico stage opportunità nel flow `log-call-outcome`
- supporto per `meeting`, `email`, `whatsapp`, `note`
- follow-up suggerito anche da interazioni non telefoniche

## Endpoint nuovo
`POST /api/shortcut/log-interaction`

Body esempio:
```json
{
  "query": "Mario Rossi",
  "kind": "meeting",
  "content": "Meeting positivo. Inviare proposta aggiornata domani.",
  "createFollowup": true,
  "shortcutToken": "SHORTCUT_SHARED_TOKEN"
}
```

## Esito chiamata v8
Quando il record risolto è un'opportunità, Quadra prova anche ad aggiornare lo `stage`:
- hot -> proposal
- warm -> qualified
- cold -> contacted
- lost -> lost
