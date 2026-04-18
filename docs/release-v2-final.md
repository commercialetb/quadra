# Quadra v2 finale

## Interventi eseguiti
- Rimozione completa del modulo `projects` da app e schema SQL
- Pulizia file duplicati e residui di patch
- Aggiunta `.env.example`, `.gitignore` e note di produzione
- Aggiunta endpoint `GET /api/health`
- Hardening shortcut: supporto sia token condiviso sia sessione autenticata dell'app
- Riscrittura del flusso Siri per allinearlo al dominio reale senza `projects`

## Limiti da chiudere prima di un deploy production blindato
- Eseguire `npm install`
- Eseguire `npm run check`
- Chiudere il debito TypeScript residuo, soprattutto sui callback con `implicit any`
- Verificare login, create/edit CRUD e workflow shortcut su ambiente reale
