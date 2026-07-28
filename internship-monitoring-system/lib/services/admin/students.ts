import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/types";

type DbStudent = {
  id: string;
  student_number: string;
  name: string;
  program: { program_name: string } | null;
  section: { section_name: string } | null;
  phone_number: string;
  email_address: string;
  hte_companies: {
    id: string;
    company_name: string;
    address: string | null;
    contact_person: string | null;
    contact_number: string | null;
    email: string | null;
    status: string;
  } | null;
  student_work_schedules: {
    expected_time_in: string;
    expected_time_out: string;
    required_hours: number;
    grace_minutes: number;
  } | null;
};

export async function getAllStudents(
  _filters?: { year?: string; semester?: string }
): Promise<Student[]> {
  const supabase = createClient();

  let query = supabase
    .from("students")
    .select(`
      id,
      student_number,
      name,
      program:programs(program_name),
      section:sections(section_name),
      phone_number,
      email_address,
      hte_companies!students_hte_id_fkey(
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status
      ),
      student_work_schedules!student_work_schedules_student_id_fkey(
        expected_time_in,
        expected_time_out,
        required_hours,
        grace_minutes
      )
    `);

  // Apply Supabase-side filters when provided
  // NOTE: students table doesn't have school_year_id/semester_id columns yet.
  // Uncomment these once those columns exist:
  // if (filters?.year) {
  //   query = query.eq("school_year_id", filters.year);
  // }
  // if (filters?.semester) {
  //   query = query.eq("semester_id", filters.semester);
  // }

  query = query.order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as DbStudent[]).map((student) => ({
    id: student.id,
    studentNumber: student.student_number,
    name: student.name,
    program: student.program?.program_name ?? "Unknown",
    section: student.section?.section_name ?? "Unknown",
    email: student.email_address,
    contactNumber: student.phone_number,
    hte: student.hte_companies
      ? {
          id: student.hte_companies.id,
          companyName: student.hte_companies.company_name,
          address: student.hte_companies.address,
          contactPerson: student.hte_companies.contact_person,
          contactNumber: student.hte_companies.contact_number,
          email: student.hte_companies.email,
          status: student.hte_companies.status,
        }
      : null,
    schedule: student.student_work_schedules
      ? {
          expectedTimeIn: student.student_work_schedules.expected_time_in,
          expectedTimeOut: student.student_work_schedules.expected_time_out,
          requiredHours: student.student_work_schedules.required_hours,
          graceMinutes: student.student_work_schedules.grace_minutes,
        }
      : null,
  }));
}
