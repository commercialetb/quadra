# Quadra v11 production hardening

Novità v11:
- manifest Siri aggiornato a v11
- install page allineata alla review queue e al check ambiente
- endpoint `/api/health` con checks di configurazione non sensibili
- `resolve-review` autorizzabile sia da sessione app sia da shortcut token
- script `npm run preflight` per verificare env minime prima del deploy
- copy aggiornata su Siri workspace e review queue

Checklist minima deploy:
1. configurare `.env` partendo da `.env.example`
2. eseguire `npm run preflight`
3. verificare `GET /api/health`
4. verificare `GET /api/shortcut/manifest`
5. testare almeno 1 shortcut di ricerca, 1 post-call e 1 caso review queue
