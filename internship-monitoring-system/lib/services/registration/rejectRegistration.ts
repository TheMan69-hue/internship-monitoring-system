import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { getCurrentCoordinator } from "@/lib/services/coordinator/getCurrentCoordinator";

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

export async function rejectRegistration(
  registrationId: string,
  rejectionReason: string
) {

  const registration =
    await getRegistration(registrationId);

  const coordinator =
    await getCurrentCoordinator();

  const { error: insertError } =
    await supabaseAdmin
      .from("rejected_registrations")
      .insert({

        student_number:
          registration.student_number,

        name:
          registration.name,

        program:
          registration.program,

        section:
          registration.section,

        program_id:
          registration.program_id,

        section_id:
          registration.section_id,

        phone_number:
          registration.phone_number,

        email_address:
          registration.email_address,

        hte_id:
          registration.hte_id,

        rejection_reason:
          rejectionReason,

        rejected_by:
          coordinator.id,

      });

  if (insertError) {
    throw insertError;
  }

  const { error: deleteError } =
    await supabaseAdmin
      .from("student_registrations")
      .delete()
      .eq("id", registrationId);

  if (deleteError) {
    throw deleteError;
  }

  return {
    success: true,
    message:
      "Registration rejected successfully.",
  };

}