# Import Excel -> Supabase (Companies + Contacts)

File sorgente previsto: `Copia di CRM.xlsx`

## Foglio `Companies`
Mappatura suggerita:
- `ID` -> `external_id`
- `Name` -> `companies.name`
- `URL` -> `companies.website`
- `Address` -> `companies.address_line1`
- `Tipologia` -> `companies.source`
- `Settore` -> `companies.industry`
- `Author` -> opzionale, solo log
- `Logo` -> ignorato nella v1

## Foglio `Contacts`
Mappatura suggerita:
- `ID` -> `external_id`
- `First Name` -> `contacts.first_name`
- `Last Name` -> `contacts.last_name`
- `Title` -> `contacts.role`
- `Email` -> `contacts.email`
- `Phone` -> `contact_phones.phone_number`
- `Mobile Phone` -> `contact_phones.phone_number`
- `Company` -> match su `companies.name`
- `Status` -> `contacts.status`
- `Author` -> opzionale, solo log

## Ordine corretto
1. import aziende
2. import contatti
3. match dei contatti su `companies.name`
4. generazione telefoni in `contact_phones`
5. report righe saltate / duplicate

## Consigli
- normalizzare spazi e maiuscole nei nomi azienda
- non importare righe totalmente vuote
- fare sempre un dry-run prima dell'upsert finale
