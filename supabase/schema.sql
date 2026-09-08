-- ============================================================
-- Skema database Nota POS — Sistem Sales & Komisi
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tabel sales ----------
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  wa text not null,
  email text,
  pin text not null,
  bank text,
  created_at timestamptz not null default now()
);

-- ---------- Tabel transactions ----------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  pkg text not null check (pkg in ('starter', 'growth')),
  client_name text not null,
  business_name text not null,
  client_wa text not null,
  sales_id uuid references sales(id) on delete set null,
  sales_name text not null,
  price numeric not null,
  commission numeric not null,
  code text,
  status text not null default 'baru'
    check (status in ('baru', 'training_requested', 'training_sent', 'claimed', 'paid')),
  training_requested_at timestamptz,
  training_sent_at timestamptz,
  claimed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Tabel settings (single row) ----------
create table if not exists settings (
  id int primary key default 1,
  admin_pin text not null default '0000',
  hosting_cost numeric not null default 550000,
  marketing_cost numeric not null default 500000,
  commission_starter numeric not null default 100000,
  commission_growth numeric not null default 250000,
  price_starter numeric not null default 800000,
  price_growth numeric not null default 1800000,
  target_clients int not null default 5,
  constraint settings_single_row check (id = 1)
);

insert into settings (id) values (1)
  on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
--
-- CATATAN KEAMANAN (baca sebelum publish ke publik):
-- Policy di bawah ini "allow all" lewat anon key — cocok untuk
-- MVP / tim kecil yang saling percaya, SAMA seperti versi
-- artifact sebelumnya (PIN dicocokkan di sisi browser).
-- Untuk keamanan produksi yang lebih baik, ganti dengan:
--   1. Supabase Auth per pengguna, atau
--   2. Edge Function yang memvalidasi PIN di server sehingga
--      kolom "pin" tidak pernah dikirim ke browser sama sekali.
-- ============================================================

alter table sales enable row level security;
alter table transactions enable row level security;
alter table settings enable row level security;

create policy "allow all sales" on sales
  for all using (true) with check (true);

create policy "allow all transactions" on transactions
  for all using (true) with check (true);

create policy "allow all settings" on settings
  for all using (true) with check (true);

-- ============================================================
-- Realtime (opsional tapi direkomendasikan)
-- Supaya admin & sales lihat data yang sama tanpa refresh manual:
-- Buka Supabase Dashboard > Database > Replication, lalu aktifkan
-- toggle Realtime untuk tabel: sales, transactions, settings.
-- ============================================================
