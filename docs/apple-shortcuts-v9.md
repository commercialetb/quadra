# Apple Shortcuts v9

Novità v9:
- review queue persistente per ambiguità e record mancanti
- best guess automatico sui candidati
- pagina interna `/capture/siri/review`
- endpoint `GET /api/shortcut/review-queue`
- endpoint `POST /api/shortcut/resolve-review`

Quando una shortcut non trova un record sicuro, Quadra salva il payload nella queue e restituisce `reviewItemId` + `openUrl` verso la review.
