# Quadra auth password patch

Questa patch sostituisce il login magic-link come flusso principale con:
- login email + password
- signup
- forgot password
- reset password
- logout
- magic link mantenuto come fallback dal login

## File inclusi
- src/app/login/page.tsx
- src/app/signup/page.tsx
- src/app/forgot-password/page.tsx
- src/app/reset-password/page.tsx
- src/app/auth/callback/route.ts
- src/components/auth/logout-button.tsx

## Configurazione Supabase
In Authentication > URL Configuration:

Site URL:
- https://tuo-dominio.vercel.app

Redirect URLs:
- https://tuo-dominio.vercel.app/auth/callback
- https://tuo-dominio.vercel.app/reset-password
- http://localhost:3000/auth/callback
- http://localhost:3000/reset-password

## Note
- Il reset usa `redirectTo=/auth/callback?next=/reset-password`
- La pagina reset-password richiede che il link di email sia aperto nello stesso browser
- Assicurati che il middleware escluda almeno `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`
