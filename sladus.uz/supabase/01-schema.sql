-- ============================================================
--  SLADUS — ma'lumotlar bazasi sxemasi
--  Supabase → SQL Editor → shu faylni to'liq qo'ying → Run
-- ============================================================

-- ---------- 1. Administratorlar ro'yxati ----------
-- Faqat shu jadvaldagi email yoza oladi. Ro'yxatdan o'tgan
-- boshqa foydalanuvchi hech narsani o'zgartira olmaydi.

create table if not exists admins (
  email text primary key,
  note  text default '',
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$ language sql stable security definer;

-- ---------- 2. Jadvallar ----------

create table if not exists categories (
  id       text primary key,
  name     jsonb not null default '{}'::jsonb,
  tagline  jsonb not null default '{}'::jsonb,
  descr    jsonb not null default '{}'::jsonb,
  img      text default '',
  color    text default 'brand',
  sort     int  default 0,
  created_at timestamptz default now()
);

create table if not exists products (
  id          text primary key,
  cat         text references categories(id) on delete set null,
  name        text not null,
  code        text default '',
  img         text default '',
  descr       jsonb not null default '{}'::jsonb,
  composition jsonb not null default '{}'::jsonb,
  storage     jsonb not null default '{}'::jsonb,
  nutrition   jsonb not null default '{}'::jsonb,
  pack        jsonb not null default '{}'::jsonb,
  active      boolean default true,
  sort        int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists products_cat_idx  on products (cat);
create index if not exists products_sort_idx on products (sort, name);
create index if not exists products_act_idx  on products (active);

create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  company    text default '' check (char_length(company) <= 120),
  phone      text default '' check (char_length(phone) <= 40),
  email      text default '' check (char_length(email) <= 120),
  country    text default '' check (char_length(country) <= 80),
  interest   text default '' check (char_length(interest) <= 80),
  message    text default '' check (char_length(message) <= 3000),
  is_read    boolean default false,
  created_at timestamptz default now()
);

create or replace function touch_updated() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_touch on products;
create trigger products_touch before update on products
for each row execute function touch_updated();

-- ---------- 3. Xavfsizlik ----------

alter table admins     enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table messages   enable row level security;

-- admins jadvalini faqat adminning o'zi ko'radi, tahrirlash — dashboard orqali
drop policy if exists admins_read on admins;
create policy admins_read on admins for select using (is_admin());

-- Katalog: hamma o'qiydi, faqat admin yozadi
drop policy if exists cat_read  on categories;
drop policy if exists cat_write on categories;
create policy cat_read  on categories for select using (true);
create policy cat_write on categories for all using (is_admin()) with check (is_admin());

drop policy if exists prod_read  on products;
drop policy if exists prod_write on products;
create policy prod_read  on products for select using (true);
create policy prod_write on products for all using (is_admin()) with check (is_admin());

-- So'rovlar: har kim yubora oladi, faqat admin o'qiydi
drop policy if exists msg_add    on messages;
drop policy if exists msg_read   on messages;
drop policy if exists msg_edit   on messages;
drop policy if exists msg_remove on messages;
create policy msg_add    on messages for insert with check (true);
create policy msg_read   on messages for select using (is_admin());
create policy msg_edit   on messages for update using (is_admin());
create policy msg_remove on messages for delete using (is_admin());

-- ---------- 4. Rasmlar ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists img_read   on storage.objects;
drop policy if exists img_add    on storage.objects;
drop policy if exists img_remove on storage.objects;
create policy img_read   on storage.objects for select using (bucket_id = 'products');
create policy img_add    on storage.objects for insert with check (bucket_id = 'products' and is_admin());
create policy img_remove on storage.objects for delete using (bucket_id = 'products' and is_admin());

-- ============================================================
--  MUHIM: pastdagi qatorda o'z emailingizni yozing va bajaring.
--  Aks holda hech kim (siz ham) tahrirlay olmaysiz.
-- ============================================================
-- insert into admins (email, note) values ('sizning@email.uz', 'Bosh admin');
