# Apple Shortcuts v7

La shortcut **Registra esito chiamata** ora supporta inferenza automatica lato Quadra.

## Cosa capisce
- lead caldo / tiepido / freddo / perso
- priorita suggerita
- data follow-up suggerita
- titolo follow-up suggerito

## Esempio
Body minimo:

```json
{
  "query": "Mario Rossi",
  "outcome": "Interessato. Vuole proposta aggiornata entro venerdi.",
  "createFollowup": true
}
```

Quadra prova a completare automaticamente:
- `followupTitle`
- `followupDate`
- `priority`

Se vuoi, puoi comunque forzare i valori nel body.
