import { createClient } from "@/lib/supabase/server";

export async function getRejectedApplications() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const {
    data,
    error,
  } = await supabase
    .from("rejected_registrations")
    .select(`
    *
    `)
    .order(
      "rejected_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
    console.log(error);
  }
  console.log(
    "REJECTED DATA:",
    data
    );
  return data ?? [];

}