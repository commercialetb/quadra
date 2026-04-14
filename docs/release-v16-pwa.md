# Release v16 PWA

## Obiettivo
Rendere Quadra più vicina a una vera app installabile su iPhone e su desktop, senza toccare ancora il layer Shortcut.

## Cosa include
- registrazione automatica del service worker
- `public/sw.js` con cache base per icone, manifest e navigazione
- pagina offline `/offline`
- `manifest.webmanifest` più completo: scope, orientation, lang, categories, display override
- metadata Next aggiornati con manifest e status bar iPhone più nativa
- rifinitura CSS per `display-mode: standalone`

## Test consigliati
- aprire il sito da Safari su iPhone
- Aggiungi a Home
- aprire Quadra dalla Home
- verificare top safe area e bottom nav
- mettere il device offline e verificare fallback `/offline`
