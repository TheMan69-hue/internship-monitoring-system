create or replace function public.get_latest_student_profile()
returns table (
  student_number text,
  name text,
  program text,
  section text,
  phone_number text,
  email_address text,
  current_location text
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
    s.current_location
  from public.students s
  order by s.created_at desc
  limit 1
$$;

grant execute on function public.get_latest_student_profile() to anon, authenticated;
