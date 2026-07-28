import { createClient } from "@/lib/supabase/client";
import type { Intern } from "@/lib/types";

type DbRegistration = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  email_address: string;
  phone_number: string;
  status: string;
  created_at: string;
  programs: { program_name: string } | null;
  sections: { section_name: string } | null;
};

export async function getAdminRegistrations(
  _filters?: { year?: string; semester?: string }
): Promise<Intern[]> {
  const supabase = createClient();

  let query = supabase
    .from("student_registrations")
    .select(`
      id,
      student_number,
      name,
      program,
      section,
      email_address,
      phone_number,
      status,
      created_at,
      programs:programs(program_name),
      sections:sections(section_name)
    `);

  // Apply Supabase-side filters when provided
  // NOTE: student_registrations doesn't have school_year_id/semester_id columns yet.
  // Uncomment these once those columns exist:
  // if (filters?.year) {
  //   query = query.eq("school_year_id", filters.year);
  // }
  // if (filters?.semester) {
  //   query = query.eq("semester_id", filters.semester);
  // }

  query = query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((reg) => {
    const row = reg as unknown as DbRegistration;
    return {
      id: row.id ?? "",
      name: row.name ?? "",
      email: row.email_address ?? "",
      course: row.programs?.program_name ?? row.program ?? "",
      academicYear: "",
      semester: "1st" as const,
      status: (row.status?.toLowerCase() as Intern["status"]) ?? "pending",
      section: row.sections?.section_name ?? row.section ?? "",
      hte: undefined,
    };
  });
}
