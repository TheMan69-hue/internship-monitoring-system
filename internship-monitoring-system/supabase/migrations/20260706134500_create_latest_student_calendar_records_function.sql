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
