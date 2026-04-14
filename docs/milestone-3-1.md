# Milestone 3.1 — Data Import & Normalization

## Obiettivo
Permettere a Quadra di importare Excel/CSV in modo guidato, sicuro e ripetibile.

## Scope incluso
- upload file `.xlsx`, `.xls`, `.csv`
- analisi fogli e colonne
- suggerimento automatico del tipo foglio (`companies`, `contacts`, `opportunities`, `followups`, `unknown`)
- mapping guidato colonne -> campi CRM
- preview delle prime righe
- validazione minima
- staging su Supabase
- report finale di import

## Flusso UX
1. Upload file
2. Analisi automatica
3. Selezione foglio
4. Mapping colonne
5. Preview import
6. Conferma staging
7. Conferma import finale
8. Report

## Note tecniche
- Questa milestone crea il modulo e la struttura dati.
- L'import finale è pensato per essere esteso con deduplica più avanzata nella milestone successiva.
