-- Staging suggerita per import controllato da CSV/Excel convertito
create table if not exists import_companies_staging (
  id bigserial primary key,
  owner_id uuid not null,
  external_id text,
  name text,
  website text,
  address text,
  source text,
  industry text,
  raw_author text,
  created_at timestamptz default now()
);

create table if not exists import_contacts_staging (
  id bigserial primary key,
  owner_id uuid not null,
  external_id text,
  first_name text,
  last_name text,
  role text,
  email text,
  phone text,
  mobile_phone text,
  company_name text,
  status text,
  raw_author text,
  created_at timestamptz default now()
);

-- Nota: l'upsert finale conviene farlo via script applicativo,
-- così puoi gestire match, duplicati e log in modo più leggibile.
