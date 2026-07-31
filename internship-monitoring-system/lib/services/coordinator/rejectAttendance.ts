import { createClient } from "@/lib/supabase/server";

export async function rejectAttendance(
  attendanceId: string
) {
  const supabase = await createClient();

  // Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  // Get profile
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found.");
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
    throw new Error("Coordinator not found.");
  }

  // Reject attendance
  const { data, error } = await supabase
    .from("attendance_logs")
    .update({
      status: "Incomplete",
      flagged_for_review: false,
      reviewed_by: coordinator.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", attendanceId)
    .select();

  console.log("========== REJECT ATTENDANCE ==========");
  console.log("Attendance ID:", attendanceId);
  console.log("Coordinator ID:", coordinator.id);
  console.log("Updated rows:", data);
  console.log("Update error:", error);

  if (error) {
    throw error;
  }

  return true;
}