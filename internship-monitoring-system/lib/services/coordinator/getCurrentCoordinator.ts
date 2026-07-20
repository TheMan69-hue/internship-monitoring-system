import { createClient } from "@/lib/supabase/server";

export async function getCurrentCoordinator() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated.");
  }

  // Get profile
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

  if (profileError || !profile) {
    throw new Error("Coordinator profile not found.");
  }

  // Get coordinator
  const {
    data: coordinator,
    error: coordinatorError,
  } = await supabase
    .from("coordinators")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (coordinatorError || !coordinator) {
    throw new Error("Coordinator record not found.");
  }

  return coordinator;
}