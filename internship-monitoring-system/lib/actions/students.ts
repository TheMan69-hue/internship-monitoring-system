"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Student } from "@/lib/types";

type DbStudent = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  phone_number: string;
  email_address: string;
  program_info: { program_name: string } | null;
  section_info: { section_name: string } | null;
  hte_companies: {
    id: string;
    company_name: string;
    address: string | null;
    contact_person: string | null;
    contact_number: string | null;
    email: string | null;
    status: string;
  } | null;
};

export async function fetchStudents(
  _filters?: { year?: string; semester?: string }
): Promise<Student[]> {
  let query = supabaseAdmin
    .from("students")
    .select(`
      id,
      student_number,
      name,
      program,
      section,
      phone_number,
      email_address,
      program_info:programs(program_name),
      section_info:sections(section_name),
      hte_companies!students_hte_id_fkey(
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status
      )
    `);

  // students table has semester_id column
  if (_filters?.semester) {
    query = query.eq("semester_id", _filters.semester);
  }

  query = query.order("name", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error (fetchStudents):", error);
    throw error;
  }

  return ((data ?? []) as unknown as DbStudent[]).map((student) => ({
    id: student.id,
    studentNumber: student.student_number,
    name: student.name,
    program: student.program_info?.program_name ?? student.program ?? "Unknown",
    section: student.section_info?.section_name ?? student.section ?? "Unknown",
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
    schedule: null,
  }));
}