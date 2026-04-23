# Release v20 Gmail Sync

## Novita
- endpoint `POST /api/shortcut/sync-gmail-crm`
- shortcut `Sync Gmail CRM`
- sincronizzazione batch di email con label CRM
- creazione automatica di azienda e contatto dal mittente quando mancanti
- creazione automatica del follow-up quando l'inferenza lo suggerisce

## Input
- `requiredLabel` default `CRM`
- `emails[]` con fromEmail, fromName, subject, snippet/body, gmailLabels, threadId, messageId
- flag per auto-creazione company/contact/followup

## Output
- conteggi processate, ignorate, fallite
- conteggi aziende create, contatti creati, follow-up creati
- dettagli per ogni email processata
