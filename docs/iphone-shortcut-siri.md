# Quadra Follow-up Vocale — Shortcut iPhone

## Variabile env richiesta
Aggiungi in Vercel:

```env
SHORTCUT_SHARED_TOKEN=una-stringa-lunga-casuale
```

## Endpoint usati
- `POST /api/shortcut/process-voice-note`
- `POST /api/shortcut/confirm-voice-note`

## Shortcut: struttura

### 1) Azione: Detta testo
Salva il risultato in `Dettato`.

### 2) Azione: Testo
Crea JSON:

```json
{
  "note": "Dettato",
  "shortcutToken": "IL_TUO_TOKEN"
}
```

### 3) Azione: Ottieni contenuti di URL
- URL: `https://TUO-DOMINIO/api/shortcut/process-voice-note`
- Metodo: `POST`
- Tipo richiesta: `JSON`
- Corpo: usa il dizionario JSON del passo 2
- Header opzionale: `x-shortcut-token: IL_TUO_TOKEN`

### 4) Azione: Ottieni valore dizionario
Leggi `needsConfirmation`.

## Ramo A — match chiaro
Se `needsConfirmation` e falso:

### 5A) Aggiungi nuovo promemoria
- Titolo: `reminderTitle`
- Data: `reminderDate`
- Note: `reminderNotes`

### 6A) Mostra notifica oppure Pronuncia testo
Usa `spokenResponse`.

## Ramo B — match ambiguo
Se `needsConfirmation` e vero:

### 5B) Scegli da elenco
Usa `contactOptions` se presenti.
Ogni elemento ha:
- `id`
- `label`

### 6B) Scegli da elenco
Usa `opportunityOptions` se presenti.

### 7B) Opzionale: Scegli da elenco
Usa `companyOptions` se serve.

### 8B) Azione: Testo
Crea secondo JSON:

```json
{
  "note": "Dettato",
  "shortcutToken": "IL_TUO_TOKEN",
  "parsed": "parsed del primo endpoint",
  "selectedContactId": "id scelto",
  "selectedOpportunityId": "id scelto",
  "selectedCompanyId": "id scelto"
}
```

### 9B) Azione: Ottieni contenuti di URL
- URL: `https://TUO-DOMINIO/api/shortcut/confirm-voice-note`
- Metodo: `POST`
- Tipo richiesta: `JSON`
- Corpo: JSON del passo 8B

### 10B) Aggiungi nuovo promemoria
- Titolo: `reminder.title`
- Data: `reminder.dueDateISO`
- Note: `reminder.notes`

### 11B) Pronuncia testo o mostra notifica
Usa `spokenResponse`.

## Frasi consigliate per Siri
- "Aggiungi follow-up Quadra"
- "Nota vocale Quadra"
- "Aggiorna Quadra"

## Frase esempio
"Ho parlato con l'architetto Pinco e mi ha detto che il progetto EUR e in stallo e di richiamarlo il 25 aprile"
