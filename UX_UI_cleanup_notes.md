# Quadra UX/UI cleanup

Interventi applicati in questa revisione:

1. Ripristinata una vera shell desktop con sidebar premium e gerarchia più chiara.
2. Riportata la bottom navigation a comportamento mobile/tablet invece che globale.
3. Rifatta la topbar per essere più pulita, stabile e coerente con i mockup.
4. Rifatto l'hero della dashboard con tone of voice più vicino alle reference.
5. Ripulita la resa visiva di metric card, panel card, liste, bottoni e form con un linguaggio più soft-glass.
6. Aggiunti override CSS finali per correggere il caos accumulato nelle versioni precedenti senza dover riscrivere tutto il progetto.

File principali modificati:
- `src/components/shell.tsx`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/app/globals.css`

Nota verifica:
Nel container non è stato possibile fare una build completa del progetto perché il repository non ha `node_modules` installati e `npm install` non ha prodotto una installazione utilizzabile qui. Ho però controllato la coerenza strutturale delle modifiche e lasciato il progetto pronto per test locale.

Comandi consigliati in locale:

```bash
npm install
npm run dev
```

Checklist visuale:
- dashboard desktop con sidebar a sinistra
- dock mobile visibile solo sotto breakpoint
- topbar non compressa
- cards più ariose e meno "enterprise"
- hero e metriche più vicine al mood mockup
