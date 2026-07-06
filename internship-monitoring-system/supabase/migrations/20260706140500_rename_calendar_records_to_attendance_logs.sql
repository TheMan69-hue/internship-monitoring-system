do $$
begin
  if to_regclass('public.student_calendar_records') is not null
    and to_regclass('public.attendance_logs') is null then
    alter table public.student_calendar_records rename to attendance_logs;
  end if;
end $$;

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null default current_date,
  time_in timestamptz,
  time_out timestamptz,
  location jsonb,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_logs'
      and column_name = 'record_date'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_logs'
      and column_name = 'date'
  ) then
    alter table public.attendance_logs rename column record_date to date;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_logs'
      and column_name = 'recorded_at'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_logs'
      and column_name = 'created_at'
  ) then
    alter table public.attendance_logs rename column recorded_at to created_at;
  end if;
end $$;

alter table public.attendance_logs
  add column if not exists date date default current_date,
  add column if not exists time_in timestamptz,
  add column if not exists time_out timestamptz,
  add column if not exists location jsonb,
  add column if not exists created_at timestamptz not null default now();

alter table public.attendance_logs
  drop column if exists record_date,
  drop column if exists record_at,
  drop column if exists recorded_at,
  drop column if exists notes;

create index if not exists idx_attendance_logs_student_date
  on public.attendance_logs (student_id, date desc);

alter table public.attendance_logs enable row level security;

drop policy if exists "Students can read their own calendar records" on public.attendance_logs;
drop policy if exists "Students can insert their own calendar records" on public.attendance_logs;
drop policy if exists "Students can update their own calendar records" on public.attendance_logs;
drop policy if exists "Students can delete their own calendar records" on public.attendance_logs;
drop policy if exists "Students can read their own attendance logs" on public.attendance_logs;
drop policy if exists "Students can insert their own attendance logs" on public.attendance_logs;
drop policy if exists "Students can update their own attendance logs" on public.attendance_logs;
drop policy if exists "Students can delete their own attendance logs" on public.attendance_logs;

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

drop function if exists public.get_latest_student_calendar_records();

create or replace function public.get_latest_student_attendance_logs()
returns table (
  date date,
  status text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.date,
    r.status
  from public.attendance_logs r
  where r.student_id = (
    select s.id
    from public.students s
    order by s.created_at desc
    limit 1
  )
  order by r.date asc
$$;

grant execute on function public.get_latest_student_attendance_logs() to anon, authenticated;

create or replace function public.record_student_attendance(
  p_action text,
  p_location jsonb
)
returns public.attendance_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_student_id uuid;
  v_log public.attendance_logs;
begin
  v_action := replace(lower(p_action), '-', '_');

  if v_action not in ('time_in', 'time_out') then
    raise exception 'Unsupported attendance action: %', p_action
      using errcode = '22023';
  end if;

  select s.id
  into v_student_id
  from public.students s
  where s.user_id = auth.uid()
  limit 1;

  if v_student_id is null then
    select s.id
    into v_student_id
    from public.students s
    order by s.created_at desc
    limit 1;
  end if;

  if v_student_id is null then
    raise exception 'No student profile found to record attendance.'
      using errcode = 'P0002';
  end if;

  if v_action = 'time_in' then
    insert into public.attendance_logs (student_id, date, time_in, location, status)
    values (
      v_student_id,
      current_date,
      now(),
      jsonb_build_object('time_in', p_location),
      'present'
    )
    on conflict (student_id, date)
    do update set
      time_in = coalesce(public.attendance_logs.time_in, excluded.time_in),
      location = coalesce(public.attendance_logs.location, '{}'::jsonb)
        || jsonb_build_object('time_in', p_location),
      status = 'present'
    returning *
    into v_log;

    return v_log;
  end if;

  update public.attendance_logs
  set
    time_out = coalesce(time_out, now()),
    location = coalesce(location, '{}'::jsonb) || jsonb_build_object('time_out', p_location),
    status = 'present'
  where student_id = v_student_id
    and date = current_date
    and time_in is not null
  returning *
  into v_log;

  if v_log.id is null then
    raise exception 'Time in before recording time out.'
      using errcode = 'P0002';
  end if;

  return v_log;
end;
$$;

grant execute on function public.record_student_attendance(text, jsonb) to authenticated;
