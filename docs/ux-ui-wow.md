# Quadra UI v2

Incluso in questo pacchetto:
- app shell responsive desktop / tablet / mobile
- top safe-area friendly per iPhone e Dynamic Island mindset
- bottom navigation mobile
- dashboard rifatta in stile premium, pulita e operativa
- auth pages con email/password, signup, forgot password, reset password
- callback auth aggiornata con supporto `next`
- middleware aggiornato per lasciare libere le route auth

## Test minimi dopo il deploy
1. `/login`
2. `/signup`
3. `/forgot-password`
4. `/reset-password`
5. login con password
6. logout
7. `/dashboard`
8. `/companies`
9. `/contacts`
10. `/opportunities`
11. `/followups`

## Redirect URLs Supabase
- `https://quadra-alpha.vercel.app/auth/callback`
- `https://quadra-alpha.vercel.app/reset-password`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`
