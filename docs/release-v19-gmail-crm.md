# Release v19 - Gmail CRM

## Novità
- Nuovo endpoint `POST /api/shortcut/ingest-gmail-crm`
- Nuovo template shortcut `public/shortcuts/ingest-gmail-crm.json`
- Manifest shortcut aggiornato a v19
- Pagina installazione aggiornata con flusso Gmail CRM

## Cosa fa
- Processa solo email Gmail con etichetta `CRM`
- Ignora le email senza etichetta `CRM`
- Se il mittente non esiste, può creare automaticamente azienda e contatto
- Registra l'email come attività
- Può creare automaticamente un follow-up suggerito

## Input principali
- `fromEmail`
- `fromName`
- `subject`
- `snippet`
- `body`
- `gmailLabels`
- `threadId`
- `messageId`
- `createCompanyIfMissing`
- `createContactIfMissing`
- `createFollowup`

## Risposte utili
- `ignored`
- `reason`
- `createdCompany`
- `createdContact`
- `activityId`
- `createdFollowupId`
- `openUrl`
- `spokenResponse`
