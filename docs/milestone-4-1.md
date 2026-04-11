# Milestone 4.1 — LLM Inside Quadra

## Obiettivo
Aggiungere un layer AI utile davvero, senza rendere il CRM fragile.

## Stack
- Provider: Groq
- Adapter astratto: `src/lib/ai/*`
- API routes:
  - `/api/ai/summarize-note`
  - `/api/ai/suggest-next-action`
  - `/api/ai/daily-brief`

## Variabili ambiente
- `LLM_PROVIDER=groq`
- `LLM_MODEL=llama-3.1-8b-instant`
- `GROQ_API_KEY=...`
- `GROQ_BASE_URL=https://api.groq.com/openai/v1`

## Casi d'uso consigliati
1. Riassumere note lunghe
2. Suggerire il prossimo follow-up
3. Creare un daily brief in dashboard

## Nota
La patch non forza ancora un widget UI definitivo. Aggiunge il layer server-side pronto da collegare ai componenti esistenti.
