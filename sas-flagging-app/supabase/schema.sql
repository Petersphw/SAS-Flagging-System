-- =====================================================================
-- SANDOCK AUSTRAL SHIPYARDS — PPE FLAGGING SYSTEM DATABASE SCHEMA
-- PostgreSQL Schema for Supabase
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Departments Table
create table if not exists public.departments (
  id text primary key,
  name text not null,
  head text not null,
  cluster text not null,
  icon text default 'building',
  acc text default '#38bdf8',
  created_at timestamptz default now()
);

-- 2. People (Staff Directory) Table
create table if not exists public.people (
  id text primary key,
  name text not null,
  role text not null,
  dept_id text references public.departments(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- 3. Flags Table (PPE Traffic-Light Observations)
create table if not exists public.flags (
  id text primary key default ('flag_' || substr(md5(random()::text), 1, 10)),
  person_id text references public.people(id) on delete cascade,
  dept_id text references public.departments(id) on delete cascade,
  type text not null check (type in ('yellow', 'orange', 'red')),
  ppe text not null,
  location text not null,
  date date not null default current_date,
  time text not null default to_char(now(), 'HH24:MI'),
  issued_by text not null,
  notes text default '',
  status text not null default 'open' check (status in ('open', 'ack', 'closed')),
  is_demo boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Escalations Table
create table if not exists public.escalations (
  id text primary key default ('esc_' || substr(md5(random()::text), 1, 10)),
  flag_id text references public.flags(id) on delete cascade,
  target_email text not null,
  level text not null check (level in ('foreman', 'hr')),
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'acknowledged')),
  notified_at timestamptz,
  created_at timestamptz default now()
);

-- 5. Admins Table
create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  password_hash text,
  must_reset boolean default false,
  created_at timestamptz default now()
);

-- 6. Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  details jsonb default '{}'::jsonb,
  performed_by text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.departments enable row level security;
alter table public.people enable row level security;
alter table public.flags enable row level security;
alter table public.escalations enable row level security;
alter table public.admins enable row level security;
alter table public.audit_logs enable row level security;

-- Read policies (Allow public read for observer compliance dashboard)
create policy "Allow read all departments" on public.departments for select using (true);
create policy "Allow read all people" on public.people for select using (true);
create policy "Allow read all flags" on public.flags for select using (true);
create policy "Allow read all escalations" on public.escalations for select using (true);
create policy "Allow read all admins" on public.admins for select using (true);

-- Mutate policies (Allow authorized inserts/updates)
create policy "Allow insert flags" on public.flags for insert with check (true);
create policy "Allow update flags" on public.flags for update using (true);
create policy "Allow delete flags" on public.flags for delete using (true);

create policy "Allow insert escalations" on public.escalations for insert with check (true);
create policy "Allow update escalations" on public.escalations for update using (true);

create policy "Allow insert people" on public.people for insert with check (true);
create policy "Allow update people" on public.people for update using (true);
create policy "Allow delete people" on public.people for delete using (true);

create policy "Allow insert departments" on public.departments for insert with check (true);
create policy "Allow update departments" on public.departments for update using (true);

create policy "Allow update admins" on public.admins for update using (true);
create policy "Allow insert audit_logs" on public.audit_logs for insert with check (true);

-- Seed Official SAS Organogram
insert into public.departments (id, name, head, cluster, icon, acc) values
  ('d-exec', 'Executive Leadership', 'Prasheen Maharaj (CEO)', 'Executive', 'crown', '#38bdf8'),
  ('d-hr', 'Human Resources', 'Adv Sinqobile Khuluse (Chief People Officer)', 'Operations', 'heart', '#60a5fa'),
  ('d-fin', 'Finance & Accounting', 'Peter Small (Finance Executive)', 'Operations', 'dollar', '#2563eb'),
  ('d-rev', 'Revenue Generation', 'Akash Singh (BU Head)', 'Operations', 'trending', '#34e39c'),
  ('d-scm', 'Supply Chain Management', 'Akash Singh (Acting Head)', 'Operations', 'box', '#38bdf8'),
  ('d-fac', 'Facilities & Maintenance', 'Fred Schoon (Senior Manager)', 'Operations', 'tool', '#f2c14e'),
  ('d-ship', 'Shipbuilding & Ship Repair', 'Mark Richards (Senior Manager)', 'Operations', 'anchor', '#ef8550'),
  ('d-sherq', 'Safety, Health, Environment, Risk & Quality (SHERQ)', 'Don Khumalo (BU Head)', 'Operations', 'shield', '#f25c70'),
  ('d-ppmo', 'Project Portfolio Management (PPMO)', 'Momelezi Cele (BU Head)', 'Operations', 'layers', '#60a5fa')
on conflict (id) do nothing;

-- Seed Admin Accounts
insert into public.admins (email, name, must_reset) values
  ('petersm@sas.co.za', 'Peter Small', false),
  ('NandiL@sas.co.za', 'Nandi Luthuli', false)
on conflict (email) do nothing;
