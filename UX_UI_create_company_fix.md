# Fix creazione azienda

Correzione applicata al form **Nuova azienda**.

## Problema
Nel modal di creazione mancava il campo `Indirizzo`, mentre era disponibile solo nella modifica della scheda azienda.

## Correzione
- aggiunto il campo `Indirizzo` nel modal di creazione
- collegato il campo al salvataggio server action con `address_line1`
- migliorata la griglia del form facendo occupare due colonne a `Indirizzo` e `Fonte`

## File modificati
- `src/components/crm/companies-crud.tsx`
- `src/app/(app)/actions.ts`
