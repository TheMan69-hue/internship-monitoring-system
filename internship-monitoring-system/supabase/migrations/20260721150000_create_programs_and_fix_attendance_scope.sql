create extension if not exists pgcrypto;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  program_name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_programs_set_updated_at on public.programs;
create trigger trg_programs_set_updated_at
before update on public.programs
for each row
execute function public.set_updated_at();

alter table public.programs enable row level security;

drop policy if exists "Anyone can read programs" on public.programs;
create policy "Anyone can read programs"
on public.programs
for select
to anon, authenticated
using (true);

grant select on public.programs to anon, authenticated;

create or replace function public.record_student_attendance(
  p_action text,
  p_location jsonb,
  p_location_name_in text default null
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
    raise exception 'Unsupported attendance action: %', p_action using errcode = '22023';
  end if;

  select id into v_student_id from public.students where user_id = auth.uid() limit 1;

  if v_student_id is null then
    raise exception 'No student profile found for the signed-in user.' using errcode = 'P0002';
  end if;

  if v_action = 'time_in' then
    insert into public.attendance_logs (student_id, date, time_in, location, location_name_in, status)
    values (v_student_id, current_date, now(), jsonb_build_object('time_in', p_location), p_location_name_in, 'present')
    on conflict (student_id, date) do update set
      time_in = coalesce(public.attendance_logs.time_in, excluded.time_in),
      location = coalesce(public.attendance_logs.location, '{}'::jsonb) || jsonb_build_object('time_in', p_location),
      location_name_in = coalesce(public.attendance_logs.location_name_in, excluded.location_name_in),
      status = 'present'
    returning * into v_log;
    return v_log;
  end if;

  update public.attendance_logs set
    time_out = coalesce(time_out, now()),
    location = coalesce(location, '{}'::jsonb) || jsonb_build_object('time_out', p_location),
    status = 'present'
  where student_id = v_student_id and date = current_date and time_in is not null
  returning * into v_log;

  if v_log.id is null then
    raise exception 'Time in before recording time out.' using errcode = 'P0002';
  end if;

  return v_log;
end;
$$;
