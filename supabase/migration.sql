-- ============================================================
--  Hotel Manager — Supabase SQL Migration
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. CLIENTS TABLE
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text unique not null,
  telephone text,
  created_at timestamptz default now()
);

-- 2. CHAMBRES TABLE
create table if not exists chambres (
  id uuid primary key default gen_random_uuid(),
  numero int unique not null,
  type text check (type in ('simple', 'double', 'suite')) not null,
  prix numeric not null,
  disponible boolean default true,
  created_at timestamptz default now()
);

-- 3. RESERVATIONS TABLE
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  chambre_id uuid references chambres(id) on delete cascade,
  date_debut date not null,
  date_fin date not null,
  created_at timestamptz default now()
);

-- 4. ENABLE ROW LEVEL SECURITY (open access for anon key)
alter table clients enable row level security;
alter table chambres enable row level security;
alter table reservations enable row level security;

create policy "Allow all for anon" on clients for all using (true) with check (true);
create policy "Allow all for anon" on chambres for all using (true) with check (true);
create policy "Allow all for anon" on reservations for all using (true) with check (true);

-- 5. SEED INITIAL DATA
insert into clients (nom, prenom, email, telephone) values
  ('Alami',   'Mohammed', 'mohammed@example.com', '0612345678'),
  ('Benali',  'Fatima',   'fatima@example.com',   '0698765432'),
  ('Tazi',    'Youssef',  'youssef@example.com',  '0655443322'),
  ('El Amri', 'Sara',     'sara@example.com',     '0677112233')
on conflict (email) do nothing;

insert into chambres (numero, type, prix, disponible) values
  (101, 'simple', 50,  true),
  (102, 'double', 80,  true),
  (201, 'suite',  150, false),
  (202, 'double', 90,  true),
  (301, 'suite',  200, true),
  (103, 'simple', 55,  true)
on conflict (numero) do nothing;
