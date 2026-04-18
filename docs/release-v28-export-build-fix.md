# v28 export build fix

- fixed Supabase export route type explosion on Vercel build by using a stable untyped query path for entity-based CSV export
- keeps export feature unchanged for companies, contacts, opportunities and followups
