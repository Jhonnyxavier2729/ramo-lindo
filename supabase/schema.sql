-- Ramo Lindo · esquema de base de datos
-- Pega esto en Supabase → SQL Editor → Run.

create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stems       jsonb not null,                 -- [{ "id": "rosa", "j": 0.2, "k": -0.4 }, ...]
  ribbon      text,                           -- coral | cielo | fucsia
  note_text   text check (char_length(note_text) <= 120),
  note_svg    text check (char_length(note_svg) <= 200000), -- trazo a mano en SVG
  total       numeric(10, 2) not null check (total >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Cada quien ve sus ramos" on public.orders;
create policy "Cada quien ve sus ramos"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Cada quien crea sus ramos" on public.orders;
create policy "Cada quien crea sus ramos"
  on public.orders for insert
  with check (auth.uid() = user_id);
