"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Student } from "@/lib/types";

type DbStudent = {
  id: string;
  student_number: string;
  name: string;
  program: string | null;
  section: string | null;
  phone_number: string;
  email_address: string;
  hte_time_completion: number | null;
};

export async function fetchStudents(
  _filters?: { year?: string; semester?: string }
): Promise<Student[]> {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select(`
      id,
      student_number,
      name,
      program,
      section,
      phone_number,
      email_address,
      hte_time_completion
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase error (fetchStudents):", error);
    throw error;
  }

  const studentRows = (data ?? []) as unknown as DbStudent[];
  const studentIds = studentRows.map((student) => student.id);

  let renderedHoursByStudent = new Map<string, number>();

  if (studentIds.length > 0) {
    const { data: attendanceRows, error: attendanceError } = await supabaseAdmin
      .from("attendance_logs")
      .select("student_id, hours_rendered")
      .in("student_id", studentIds);

    if (!attendanceError) {
      (attendanceRows ?? []).forEach((row) => {
        const studentId = row.student_id;
        const renderedHours = Number(row.hours_rendered ?? 0);
        renderedHoursByStudent.set(
          studentId,
          (renderedHoursByStudent.get(studentId) ?? 0) + renderedHours
        );
      });
    }
  }

  return studentRows.map((student) => ({
    id: student.id,
    studentNumber: student.student_number,
    name: student.name,
    program: student.program ?? "Unknown",
    section: student.section ?? "Unknown",
    email: student.email_address,
    contactNumber: student.phone_number,
    hte: null,
    schedule: null,
    renderedHours: renderedHoursByStudent.get(student.id) ?? 0,
    totalHours: student.hte_time_completion ?? null,
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