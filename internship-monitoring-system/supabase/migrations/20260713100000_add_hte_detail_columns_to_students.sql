alter table public.students
  add column if not exists hte_name text,
  add column if not exists hte_address text,
  add column if not exists hte_time_completion text,
  add column if not exists hte_work_schedule text,
  add column if not exists hte_working_time text;

drop function if exists public.get_student_profile_by_number(text);

create or replace function public.get_student_profile_by_number(p_student_number text)
returns table (
  student_number text,
  name text,
  program text,
  section text,
  phone_number text,
  email_address text,
  current_location text,
  hte text,
  hte_name text,
  hte_address text,
  hte_time_completion text,
  hte_work_schedule text,
  hte_working_time text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.student_number,
    s.name,
    s.program,
    s.section,
    s.phone_number,
    s.email_address,
    s.current_location,
    s.hte,
    s.hte_name,
    s.hte_address,
    s.hte_time_completion,
    s.hte_work_schedule,
    s.hte_working_time
  from public.students s
  where s.student_number = p_student_number
  limit 1
$$;

grant execute on function public.get_student_profile_by_number(text) to anon, authenticated;

drop function if exists public.get_latest_student_profile();

create or replace function public.get_latest_student_profile()
returns table (
  student_number text,
  name text,
  program text,
  section text,
  phone_number text,
  email_address text,
  current_location text,
  hte text,
  hte_name text,
  hte_address text,
  hte_time_completion text,
  hte_work_schedule text,
  hte_working_time text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.student_number,
    s.name,
    s.program,
    s.section,
    s.phone_number,
    s.email_address,
    s.current_location,
    s.hte,
    s.hte_name,
    s.hte_address,
    s.hte_time_completion,
    s.hte_work_schedule,
    s.hte_working_time
  from public.students s
  order by s.created_at desc
  limit 1
$$;

grant execute on function public.get_latest_student_profile() to anon, authenticated;