# Quadra UX/UI phase 2

## Obiettivo
Portare la dashboard e la shell verso il linguaggio visivo dei mockup: più scena, più glass, voice bar protagonista, card leggere e gerarchia molto più forte.

## File modificati
- `src/components/shell.tsx`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/app/globals.css`

## Interventi principali
- shell desktop rifatta con ambient light, sidebar più premium e topbar con voice pill centrale
- dashboard trasformata in una vera hero showcase con stage centrale e voice control bar
- preview dashboard interna con focus, pipeline, contacts rail e chart finta per dare effetto mockup
- KPI row resa più coerente con il nuovo design system glass
- focus giornaliero diviso in due colonne: oggi / pipeline ferma
- override CSS finale “phase 2” per spingere blur, depth, pill, rounded corners e ritmo visivo

## Nota
Non è una copia 1:1 delle immagini, ma è un refactor molto più deciso rispetto alla pulizia precedente e punta chiaramente nella stessa direzione estetica.
