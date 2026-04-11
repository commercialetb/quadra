Quadra Milestone 4.1 patch

Contenuto:
- Provider adapter Groq
- API routes AI base
- Manifest e icone PWA/Home Screen
- Note di integrazione

Da aggiungere anche nel repo:
1. Environment variables:
   - LLM_PROVIDER=groq
   - LLM_MODEL=llama-3.1-8b-instant
   - GROQ_API_KEY=...
   - GROQ_BASE_URL=https://api.groq.com/openai/v1

2. In app/layout.tsx o metadata:
   - manifest webmanifest
   - apple touch icon

3. Collegamento UI consigliato:
   - bottone "Riassumi nota"
   - bottone "Suggerisci prossima azione"
   - card "Daily brief" in dashboard
