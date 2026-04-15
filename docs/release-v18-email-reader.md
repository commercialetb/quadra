# v18 email reader

- nuovo endpoint `POST /api/shortcut/ingest-email`
- se il mittente email non esiste puo creare automaticamente azienda e contatto
- usa il dominio email per proporre o creare l'azienda
- usa nome mittente o local-part dell'email per creare il contatto
- puo creare anche attivita email e follow-up
- aggiunto template `public/shortcuts/ingest-email.json`
- aggiornato manifest shortcut e pagina installazione
