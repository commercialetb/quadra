Quadra UI fix definitivo

Questa patch ripristina il layer visivo senza toccare logica CRM, auth o import.

File da sovrascrivere:
- src/app/layout.tsx
- src/app/globals.css
- src/components/shell.tsx

Obiettivo:
- ripristinare il CSS globale
- riattivare layout, sidebar, dashboard e bottom nav
- evitare schermate quasi unstyled
