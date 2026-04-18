# UX/UI v46 professional pass

Interventi principali:

- ripulita la shell per ridurre sovrapposizioni e box compressi su desktop, iPad e iPhone
- resa la Voice Control Bar realmente utile: click per dettare, fallback al workspace vocale, link rapidi ad assistente e shortcut
- dashboard home resa più leggibile con stage meno incasinato e card cliccabili verso record reali
- aggiunti contatti recenti in home con apertura diretta della scheda contatto
- migliorata la gerarchia delle card CRM e il layout delle azioni per evitare collisioni e wrap disordinati
- migliorati i form modal: `field-span-2`, azioni responsive, maggiore coerenza nei breakpoint
- ottimizzati topbar, mobile dock e spacing verticale/orizzontale

File toccati:

- `src/components/voice-control-bar.tsx`
- `src/components/shell.tsx`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/lib/dashboard-queries.ts`
- `src/components/crm/companies-crud.tsx`
- `src/components/crm/contacts-crud.tsx`
- `src/components/crm/opportunities-crud.tsx`
- `src/app/globals.css`

Nota:
non ho potuto eseguire una build completa nel container per assenza delle dipendenze installate localmente. La revisione è stata fatta sul codice e va verificata in locale con `npm install` e `npm run dev`.
