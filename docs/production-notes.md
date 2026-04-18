# Production notes

## Checklist prima del deploy
- Compilare `.env.local` o le env del provider
- Applicare `supabase/schema.sql`, `supabase/views.sql`, `supabase/functions.sql`, `supabase/policies.sql`
- Eseguire facoltativamente `supabase/seed.sql` solo su ambienti di test
- Verificare login, dashboard, companies, contacts, opportunities, followups
- Verificare gli endpoint `api/shortcut/*` con token valido
- Verificare almeno un provider AI attivo

## Target consigliato
- Frontend: Vercel oppure Render static web service con Next server runtime
- Database/Auth: Supabase

## Hardening consigliato
- Ruotare `SHORTCUT_SHARED_TOKEN` per ogni ambiente
- Separare env staging e produzione
- Tenere seed e import fuori dalla pipeline di produzione
- Monitorare errori API AI e shortcut
