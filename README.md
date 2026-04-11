# Quadra CRM

CRM personale in stile semplice e operativo, costruito con:
- Supabase per database e auth
- Next.js per frontend
- Vercel per deploy

## Struttura progetto

```text
quadra-crm/
  src/
  public/
  supabase/
    schema.sql
    seed.sql
    views.sql
    policies.sql
    functions.sql
  docs/
    notes.md
    roadmap.md
  .env.example
  package.json
  README.md
```

## Ordine di setup

1. Crea il progetto Supabase.
2. Esegui in ordine:
   - `supabase/schema.sql`
   - `supabase/functions.sql`
   - `supabase/views.sql`
   - `supabase/policies.sql`
3. Avvia almeno un login per creare `profiles`.
4. Esegui `supabase/seed.sql` e poi la funzione `seed_quadra_demo('<OWNER_UUID>')`.
5. Crea `.env.local` partendo da `.env.example`.
6. Installa dipendenze con `npm install`.
7. Avvia con `npm run dev`.
8. Quando funziona tutto, collega il repo a Vercel.

## Note

- Questo repo è pensato come base solida v1.
- Prima consolidiamo UX, CRUD e dashboard.
- AI e Siri arrivano dopo, sopra una base affidabile.
