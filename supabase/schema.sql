-- BabyCheer: Supabase sxemasi. Supabase > SQL Editor ga to'liq qo'yib, "Run" bosing.
-- Xavfsizlik: mijozlar faqat mahsulotlarni ko'ra oladi va place_order() orqali buyurtma bera oladi.
-- Buyurtmalar, o'zgartirishlar va rasm yuklash faqat admins jadvalidagi foydalanuvchiga ruxsat etilgan.

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort int not null default 0
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  title text not null,
  brand text not null default '',
  price bigint not null check (price >= 0),
  old_price bigint not null default 0,
  stock int not null default 0 check (stock >= 0),
  badge text not null default '',
  short text not null default '',
  description text not null default '',
  specs jsonb not null default '{}'::jsonb,
  images text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,
  model3d text not null default '',
  featured boolean not null default false,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
-- eski bazalar uchun (ustunlar mavjud bo'lsa, o'tkazib yuboriladi)
alter table products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table products add column if not exists model3d text not null default '';
create index if not exists products_cat_idx on products(category_id);

create sequence if not exists order_no_seq start 1001;
create table if not exists orders (
  id bigint generated always as identity primary key,
  no text unique not null,
  name text not null,
  phone text not null,
  address text not null default '',
  comment text not null default '',
  delivery text not null default 'courier',
  payment text not null default 'cash',
  items jsonb not null,
  subtotal bigint not null,
  delivery_fee bigint not null default 0,
  total bigint not null,
  status text not null default 'new' check (status in ('new','confirmed','shipping','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  message text not null default '',
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists settings (key text primary key, value jsonb not null);
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- ---------- Row Level Security ----------
alter table categories enable row level security;
alter table products   enable row level security;
alter table orders     enable row level security;
alter table settings   enable row level security;
alter table messages   enable row level security;
alter table admins     enable row level security;

drop policy if exists cat_read on categories;   create policy cat_read on categories for select using (true);
drop policy if exists cat_write on categories;  create policy cat_write on categories for all using (is_admin()) with check (is_admin());
drop policy if exists prod_read on products;    create policy prod_read on products for select using (active or is_admin());
drop policy if exists prod_write on products;   create policy prod_write on products for all using (is_admin()) with check (is_admin());
drop policy if exists set_read on settings;     create policy set_read on settings for select using (true);
drop policy if exists set_write on settings;    create policy set_write on settings for all using (is_admin()) with check (is_admin());
drop policy if exists ord_admin on orders;      create policy ord_admin on orders for all using (is_admin()) with check (is_admin());
drop policy if exists msg_admin on messages;    create policy msg_admin on messages for all using (is_admin()) with check (is_admin());
drop policy if exists adm_self on admins;       create policy adm_self on admins for select using (user_id = auth.uid());

-- ---------- Buyurtma berish (narx serverda hisoblanadi, mijoz o'zgartira olmaydi) ----------
create or replace function place_order(
  p_name text, p_phone text, p_address text, p_comment text,
  p_delivery text, p_payment text, p_items jsonb
) returns json language plpgsql security definer set search_path = public as $$
declare
  it jsonb; prod products%rowtype; lines jsonb := '[]'::jsonb;
  sub bigint := 0; fee bigint := 0; tot bigint; qty int; ono text;
  st jsonb; free bigint; dfee bigint; digits text; ph text;
begin
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Ismingizni kiriting'; end if;
  digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if digits !~ '^(998)?[0-9]{9}$' then raise exception 'Telefon raqami noto''g''ri'; end if;
  ph := '+998' || right(digits, 9);
  if p_delivery not in ('courier', 'pickup') then p_delivery := 'courier'; end if;
  if p_payment not in ('cash', 'card') then p_payment := 'cash'; end if;
  if p_delivery = 'courier' and length(trim(coalesce(p_address, ''))) < 5 then raise exception 'Manzilni kiriting'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then
    raise exception 'Savat bo''sh';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    qty := coalesce((it->>'qty')::int, 0);
    select * into prod from products where id = (it->>'id')::uuid and active for update;
    if not found then raise exception 'Mahsulotlardan biri sotuvda yo''q'; end if;
    if qty < 1 or qty > 20 then raise exception 'Miqdor noto''g''ri'; end if;
    if prod.stock < qty then raise exception '"%" omborda yetarli emas (qoldi: %)', prod.title, prod.stock; end if;
    update products set stock = stock - qty where id = prod.id;
    sub := sub + prod.price * qty;
    lines := lines || jsonb_build_object('id', prod.id, 'title', prod.title, 'price', prod.price, 'qty', qty, 'color', left(coalesce(it->>'color', ''), 30));
  end loop;

  select value into st from settings where key = 'store';
  free := coalesce((st->>'freeFrom')::bigint, 1000000);
  dfee := coalesce((st->>'deliveryFee')::bigint, 40000);
  if p_delivery = 'courier' and sub < free then fee := dfee; end if;
  tot := sub + fee;
  ono := 'BC-' || nextval('order_no_seq');

  insert into orders(no, name, phone, address, comment, delivery, payment, items, subtotal, delivery_fee, total)
  values (ono, trim(p_name), ph, trim(coalesce(p_address, '')), trim(coalesce(p_comment, '')), p_delivery, p_payment, lines, sub, fee, tot);
  return json_build_object('no', ono, 'total', tot, 'fee', fee);
end $$;

create or replace function track_order(p_no text, p_phone text) returns json
language sql security definer set search_path = public as $$
  select json_build_object('no', no, 'status', status, 'total', total, 'items', items, 'created_at', created_at)
  from orders
  where no = upper(trim(p_no)) and right(regexp_replace(phone, '\D', '', 'g'), 9) = right(regexp_replace(p_phone, '\D', '', 'g'), 9)
$$;

create or replace function send_message(p_name text, p_phone text, p_message text) returns json
language plpgsql security definer set search_path = public as $$
declare digits text;
begin
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Ismingizni kiriting'; end if;
  digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if digits !~ '^(998)?[0-9]{9}$' then raise exception 'Telefon raqami noto''g''ri'; end if;
  if length(trim(coalesce(p_message, ''))) < 3 then raise exception 'Xabarni yozing'; end if;
  insert into messages(name, phone, message) values (left(trim(p_name), 80), '+998' || right(digits, 9), left(trim(p_message), 2000));
  return json_build_object('ok', true);
end $$;

grant execute on function send_message(text, text, text) to anon, authenticated;
grant execute on function place_order(text, text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function track_order(text, text) to anon, authenticated;

-- ---------- Rasmlar uchun ombor ----------
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
drop policy if exists img_read on storage.objects;  create policy img_read on storage.objects for select using (bucket_id = 'products');
drop policy if exists img_write on storage.objects; create policy img_write on storage.objects for insert with check (bucket_id = 'products' and is_admin());
drop policy if exists img_upd on storage.objects;   create policy img_upd on storage.objects for update using (bucket_id = 'products' and is_admin());
drop policy if exists img_del on storage.objects;   create policy img_del on storage.objects for delete using (bucket_id = 'products' and is_admin());

-- Yangi buyurtmalar admin panelda real vaqtda ko'rinishi uchun
do $$ begin
  alter publication supabase_realtime add table orders;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table messages;
exception when others then null; end $$;

insert into settings(key, value) values ('store', '{
  "name": "BabyCheer", "phone": "+998 99 114 90 99", "telegram": "babycheer_admin",
  "channel": "https://t.me/+9CWZLTOE7KczZjky", "instagram": "https://instagram.com/babycheer_shop",
  "freeFrom": 1000000, "deliveryFee": 40000, "warrantyMonths": 6
}'::jsonb) on conflict (key) do nothing;
