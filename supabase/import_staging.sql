create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  file_name text not null,
  status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists import_rows_staging (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references import_batches(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  sheet_name text not null,
  entity_type text not null,
  row_index integer not null,
  source_payload jsonb not null,
  mapped_payload jsonb,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_import_batches_owner on import_batches(owner_id);
create index if not exists idx_import_rows_staging_batch on import_rows_staging(batch_id);
create index if not exists idx_import_rows_staging_owner on import_rows_staging(owner_id);
