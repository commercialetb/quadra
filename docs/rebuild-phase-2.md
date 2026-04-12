Rebuild Phase 2

Obiettivo:
- UX mobile vera, non desktop rimpicciolita
- topbar e bottom nav più compatte
- form di creazione solo on demand
- dashboard più utile e meno decorativa

File riscritti:
- src/app/globals.css
- src/components/shell.tsx
- src/components/page-header.tsx
- src/components/dashboard/dashboard-shell.tsx
- src/components/crm/companies-crud.tsx
- src/components/crm/contacts-crud.tsx
- src/components/crm/opportunities-crud.tsx
- src/components/crm/followups-crud.tsx
- src/app/(app)/companies/page.tsx
- src/app/(app)/contacts/page.tsx
- src/app/(app)/opportunities/page.tsx
- src/app/(app)/followups/page.tsx

Note:
- nessuna modifica alla logica Supabase/Auth
- create/edit/delete continuano a usare le server actions esistenti
- la bottom nav mobile resta sulle 5 aree core
- Import è spostato fuori dalla nav principale e resta raggiungibile da topbar/sidebar
