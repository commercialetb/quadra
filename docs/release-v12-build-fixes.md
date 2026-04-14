# Release v12 build fixes

## Focus
Chiudere i punti di typing piu fragili del layer CRM/Siri e lasciare una base piu pronta per typecheck e build.

## Interventi
- tipizzati gli snapshot CRM in `src/lib/ai/crm-query.ts`
- tipizzate le righe timeline in `src/lib/detail-queries.ts`
- tipizzati i record esistenti import in `src/app/(app)/actions.ts`
- tipizzate agenda e review queue Siri in `src/lib/shortcut/quadra-shortcuts.ts`
- tipizzate opzioni contatti/opportunita/aziende in `src/lib/shortcut/siri-flow.ts`

## Nota
Restano da verificare build completa e dipendenze in un ambiente con `npm install` riuscito.
