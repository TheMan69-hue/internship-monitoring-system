"use server";

import { revalidatePath } from "next/cache";
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

async function resolveAuthUserId(studentId: string, emailAddress: string) {
  const { data: student, error: studentError } = await supabaseAdmin
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (student?.user_id) {
    return student.user_id as string;
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    throw authError;
  }

  const authUser = authData.users.find((user) => user.email === emailAddress);

  if (!authUser) {
    throw new Error("Auth user not found for this intern.");
  }

  return authUser.id;
}

export async function updateInternDetails(
  studentId: string,
  data: {
    fullName: string;
    email: string;
    program: string;
    section: string;
    password?: string;
  }
) {
  try {
    const { data: currentStudent, error: fetchError } = await supabaseAdmin
      .from("students")
      .select("id, email_address, user_id")
      .eq("id", studentId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!currentStudent) {
      throw new Error("Intern not found.");
    }

    const authUserId = await resolveAuthUserId(
      studentId,
      currentStudent.email_address ?? data.email
    );

    const authUpdate: {
      email?: string;
      password?: string;
      user_metadata: {
        display_name: string;
        full_name: string;
      };
    } = {
      user_metadata: {
        display_name: data.fullName,
        full_name: data.fullName,
      },
    };

    const nextEmail = data.email.trim();
    if (nextEmail) {
      authUpdate.email = nextEmail;
    }

    const nextPassword = data.password?.trim();
    if (nextPassword) {
      authUpdate.password = nextPassword;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      authUpdate
    );

    if (authError) {
      throw authError;
    }

    const { data: programRow, error: programError } = await supabaseAdmin
      .from("programs")
      .select("id, program_name")
      .eq("program_name", data.program)
      .maybeSingle();

    if (programError) {
      throw programError;
    }

    if (!programRow) {
      throw new Error("Program not found.");
    }

    const { data: sectionRow, error: sectionError } = await supabaseAdmin
      .from("sections")
      .select("id, section_name")
      .eq("section_name", data.section)
      .maybeSingle();

    if (sectionError) {
      throw sectionError;
    }

    if (!sectionRow) {
      throw new Error("Section not found.");
    }

    const { error: studentError } = await supabaseAdmin
      .from("students")
      .update({
        name: data.fullName,
        email_address: nextEmail,
        program: data.program,
        section: data.section,
        program_id: programRow.id,
        section_id: sectionRow.id,
      })
      .eq("id", studentId);

    if (studentError) {
      throw studentError;
    }

    revalidatePath("/admin/intern");

    return { success: true };
  } catch (error) {
    console.error("updateInternDetails error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to update intern details.";
    return { success: false, message };
  }
}