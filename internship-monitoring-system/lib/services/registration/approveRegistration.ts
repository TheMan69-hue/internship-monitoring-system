import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Registration = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  program_id: string;
  section_id: string;
  phone_number: string;
  email_address: string;
  hte_id: string | null;
};

async function getRegistration(
  registrationId: string
): Promise<Registration> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (error || !data) {
    throw new Error("Registration not found.");
  }

  return data as Registration;
}

export async function approveRegistration(
  registrationId: string
) {
  // Get registration
  const registration = await getRegistration(registrationId);

  // Find verified Auth user
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    throw authError;
  }

  const authUser = authData.users.find(
    (user) => user.email === registration.email_address
  );

  if (!authUser) {
    throw new Error(
      "Verified Auth user not found. Student may not have verified their email."
    );
  }

  // Prevent duplicate student records
  const { data: existingStudent, error: existingError } =
    await supabaseAdmin
      .from("students")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingStudent) {
    throw new Error("Student already exists.");
  }

  // Insert into students table
  const { error: insertError } = await supabaseAdmin
    .from("students")
    .insert({
      user_id: authUser.id,
      student_number: registration.student_number,
      name: registration.name,
      program: registration.program,
      section: registration.section,
      phone_number: registration.phone_number,
      email_address: registration.email_address,
      hte_id: registration.hte_id,
      current_location: null,
      program_id: registration.program_id,
      section_id: registration.section_id,
    });

  if (insertError) {
    throw insertError;
  }

  // Remove from pending registrations
  const { error: deleteError } = await supabaseAdmin
    .from("student_registrations")
    .delete()
    .eq("id", registrationId);

  if (deleteError) {
    throw deleteError;
  }

  return {
    success: true,
    message: "Student approved successfully.",
    studentId: authUser.id,
  };
}