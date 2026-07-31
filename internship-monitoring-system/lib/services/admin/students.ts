import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/lib/types";

type DbStudent = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  phone_number: string;
  email_address: string;
  programs: { program_name: string } | null;
  sections: { section_name: string } | null;
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
      program,
      section,
      phone_number,
      email_address,
      programs:programs(program_name),
      sections:sections(section_name),
      hte_companies (
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status
      )
    `);

  query = query.order("name", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as DbStudent[]).map((student) => ({
    id: student.id,
    studentNumber: student.student_number,
    name: student.name,
    program: student.programs?.program_name ?? student.program ?? "Unknown",
    section: student.sections?.section_name ?? student.section ?? "Unknown",
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
