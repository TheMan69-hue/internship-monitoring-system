-- Students / interns profile data
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  student_number text not null unique,
  name text not null,
  program text not null,
  section text not null,
  phone_number text,
  email_address text not null unique,
  current_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One attendance log per student per calendar day
create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null default current_date,
  time_in timestamptz,
  time_out timestamptz,
  location jsonb,
  location_name_in text,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create index if not exists idx_students_user_id on public.students (user_id);
create index if not exists idx_students_email_address on public.students (email_address);
create index if not exists idx_attendance_logs_student_date
  on public.attendance_logs (student_id, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_set_updated_at on public.students;
create trigger trg_students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

alter table public.students enable row level security;
alter table public.attendance_logs enable row level security;

drop policy if exists "Students can read their own profile" on public.students;
create policy "Students can read their own profile"
on public.students
for select
using (auth.uid() = user_id);

drop policy if exists "Students can insert their own profile" on public.students;
create policy "Students can insert their own profile"
on public.students
for insert
with check (auth.uid() = user_id);

drop policy if exists "Students can update their own profile" on public.students;
create policy "Students can update their own profile"
on public.students
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Students can delete their own profile" on public.students;
create policy "Students can delete their own profile"
on public.students
for delete
using (auth.uid() = user_id);

drop policy if exists "Students can read their own attendance logs" on public.attendance_logs;
create policy "Students can read their own attendance logs"
on public.attendance_logs
for select
using (
  exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Students can insert their own attendance logs" on public.attendance_logs;
create policy "Students can insert their own attendance logs"
on public.attendance_logs
for insert
with check (
  exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Students can update their own attendance logs" on public.attendance_logs;
create policy "Students can update their own attendance logs"
on public.attendance_logs
for update
using (
  exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "Students can delete their own attendance logs" on public.attendance_logs;
create policy "Students can delete their own attendance logs"
on public.attendance_logs
for delete
using (
  exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.user_id = auth.uid()
  )
);
