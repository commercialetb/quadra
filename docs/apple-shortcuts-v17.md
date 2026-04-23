# Apple Shortcuts v17

## Obiettivo
Consegnare all’utente finale i 6 shortcut ufficiali di Quadra senza dover reinventare payload, campi o endpoint.

## Correzioni fatte
- `today-agenda.json` ora legge `spokenResponse`
- `log-interaction.json` ora ha lo stesso formato degli altri template
- aggiunto `public/shortcuts/manifest.json`
- pagina `/capture/siri/install` semplificata e orientata alla consegna

## Sei shortcut ufficiali
1. Crea follow-up
2. Cerca record
3. Mostra oggi
4. Aggiungi nota
5. Registra esito chiamata
6. Registra interazione

## Risposta utente finale
L’utente non deve inventare JSON. Deve solo:
1. scegliere lo shortcut
2. sostituire dominio e token
3. importarlo in Apple Shortcuts
4. usare Siri
