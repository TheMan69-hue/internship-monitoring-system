import { createClient } from "@/lib/supabase/server";


export async function getCoordinatorProfile() {

  const supabase = await createClient();


  const {
    data: {
      user
    },
    error: userError

  } = await supabase.auth.getUser();


  if (userError || !user) {
    throw new Error("User not authenticated");
  }


  const { data, error } = await supabase

    .from("coordinators")

    .select(`
      id,
      employee_number,
      department,
      profiles (
        id,
        full_name,
        email
      )
    `)

    .eq(
      "profiles.user_id",
      user.id
    )

    .single();



  if (error) {
    throw error;
  }


  return data;
}