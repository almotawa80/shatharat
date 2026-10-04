-- حكم وأمثال: إعداد قاعدة البيانات في Supabase
-- يمكن تشغيله في مشروع ديواني نفسه، فالجداول هنا تبدأ بـ hikam_ ولا تمس جداول ديواني.
-- الصق الملف كاملًا في SQL Editor ثم اضغط Run.

create table if not exists public.hikam_sayings (
  id         text primary key,
  text       text    not null,
  kind       text    not null default 'hikma' check (kind in ('hikma','mathal','tarfa','ghazal')),
  topic      text    not null default '',
  note       text    not null default '',
  source     text    not null default '',
  star       boolean not null default false,
  created    bigint  not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.hikam_settings (
  id      int primary key default 1 check (id = 1),
  site    text not null default 'شذرات',
  father  text not null default 'د. عبدالعزيز فيصل المطوع',
  tagline text not null default ''
);
insert into public.hikam_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.hikam_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null check (role in ('owner','manager'))
);

create or replace function public.hikam_is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.hikam_staff where user_id = auth.uid());
$$;
create or replace function public.hikam_is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.hikam_staff where user_id = auth.uid() and role = 'owner');
$$;

-- القراءة للجميع، الإضافة والتعديل للمالك والمديرين، الحذف والإعدادات للمالك
alter table public.hikam_sayings  enable row level security;
alter table public.hikam_settings enable row level security;
alter table public.hikam_staff    enable row level security;

drop policy if exists hikam_sayings_read   on public.hikam_sayings;
drop policy if exists hikam_sayings_insert on public.hikam_sayings;
drop policy if exists hikam_sayings_update on public.hikam_sayings;
drop policy if exists hikam_sayings_delete on public.hikam_sayings;
create policy hikam_sayings_read   on public.hikam_sayings for select to anon, authenticated using (true);
create policy hikam_sayings_insert on public.hikam_sayings for insert to authenticated with check (public.hikam_is_staff());
create policy hikam_sayings_update on public.hikam_sayings for update to authenticated using (public.hikam_is_staff()) with check (public.hikam_is_staff());
create policy hikam_sayings_delete on public.hikam_sayings for delete to authenticated using (public.hikam_is_owner());

drop policy if exists hikam_settings_read   on public.hikam_settings;
drop policy if exists hikam_settings_insert on public.hikam_settings;
drop policy if exists hikam_settings_update on public.hikam_settings;
create policy hikam_settings_read   on public.hikam_settings for select to anon, authenticated using (true);
create policy hikam_settings_insert on public.hikam_settings for insert to authenticated with check (public.hikam_is_owner());
create policy hikam_settings_update on public.hikam_settings for update to authenticated using (public.hikam_is_owner()) with check (public.hikam_is_owner());

drop policy if exists hikam_staff_read_self on public.hikam_staff;
create policy hikam_staff_read_self on public.hikam_staff for select to authenticated using (user_id = auth.uid());

grant select on public.hikam_sayings, public.hikam_settings to anon, authenticated;
grant insert, update, delete on public.hikam_sayings to authenticated;
grant insert, update on public.hikam_settings to authenticated;
grant select on public.hikam_staff to authenticated;

-- بعد ذلك: أعطِ حسابك صلاحية المالك (غيّر البريد إلى بريدك المسجل في ديواني أو حساب جديد):
-- insert into public.hikam_staff (user_id, role) select id, 'owner' from auth.users where email = 'بريدك@example.com';
