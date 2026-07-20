import { createClient } from "@/lib/supabase/server";

export async function getRegistrationList() {
  const supabase = await createClient();

  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const {
    data,
    error
  } = await supabase
    .from("student_registrations")
    .select(`
      id,
      student_number,
      name,
      program,
      section,
      phone_number,
      email_address,
      status,

      hte_companies (
        id,
        company_name
      )
    `)
    .eq(
      "status",
      "Pending"
    )
    .order(
      "created_at",
      {
        ascending:false
      }
    );

  if(error){
    throw error;
  }
  return data ?? [];
}