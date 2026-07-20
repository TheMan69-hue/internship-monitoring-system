import { supabaseAdmin } from "@/lib/supabase/admin";

type RejectedRegistration = {
  id: string;
  student_number: string;
  name: string;
  program: string;
  section: string;
  phone_number: string;
  email_address: string;
  hte_id: string | null;
  program_id: string;
  section_id: string;
};

async function getRejectedRegistration(
  registrationId: string
): Promise<RejectedRegistration> {

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("rejected_registrations")
    .select("*")
    .eq("id", registrationId)
    .single();

  if (error || !data) {
    throw new Error("Rejected registration not found.");
  }

  return data as RejectedRegistration;

}

export async function restoreRegistration(
  registrationId: string
) {

  const registration =
    await getRejectedRegistration(
      registrationId
    );

  const {
    data: authData,
    error: authError,
  } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    throw authError;
  }

  const authUser =
    authData.users.find(
      (user) =>
        user.email ===
        registration.email_address
    );

  if (!authUser) {
    throw new Error(
      "Verified Auth user not found."
    );
  }

  const {
    data: existingStudent,
  } =
    await supabaseAdmin
      .from("students")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

  if (existingStudent) {
    throw new Error(
      "Student already exists."
    );
  }

  const {
    error: insertError,
  } =
    await supabaseAdmin
      .from("students")
      .insert({

        user_id:
          authUser.id,

        student_number:
          registration.student_number,

        name:
          registration.name,

        program:
          registration.program,

        section:
          registration.section,

        phone_number:
          registration.phone_number,

        email_address:
          registration.email_address,

        hte_id:
          registration.hte_id,

        current_location:
          null,

        program_id:
          registration.program_id,

        section_id:
          registration.section_id,

      });

  if (insertError) {
    throw insertError;
  }

  const {
    error: deleteError,
  } =
    await supabaseAdmin
      .from("rejected_registrations")
      .delete()
      .eq(
        "id",
        registrationId
      );

  if (deleteError) {
    throw deleteError;
  }

  return {
    success: true,
  };

}