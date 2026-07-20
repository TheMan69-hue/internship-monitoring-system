import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteRejectedRegistration(
  registrationId: string
) {

  const { error } =
    await supabaseAdmin
      .from("rejected_registrations")
      .delete()
      .eq("id", registrationId);

  if (error) {
    throw error;
  }

  return {
    success: true,
  };

}