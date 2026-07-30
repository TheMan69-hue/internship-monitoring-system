"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/services/admin/audit";

/**
 * Checks whether the currently authenticated coordinator is active.
 * Uses supabaseAdmin to bypass RLS (the browser client may be blocked).
 * Called from the login page after sign-in.
 */
export async function checkCoordinatorActive() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { active: true }; // fallback: treat as active
    }

    // Use admin client to bypass RLS
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) return { active: true };

    const { data: coord } = await supabaseAdmin
      .from("coordinators")
      .select("is_active")
      .eq("profile_id", profile.id)
      .maybeSingle();

    return { active: coord ? coord.is_active : true };
  } catch (error) {
    console.error("checkCoordinatorActive error:", error);
    return { active: true }; // fallback: treat as active
  }
}

/**
 * FR-3.1.16–3.1.17: Activate a coordinator account after a forced first-login
 * password change. Updates the auth user's password AND sets is_active = true
 * on the coordinator record.
 *
 * Called from the /coordinator/force-password-change page after the user
 * submits their new password.
 */
export async function activateCoordinator(newPassword: string) {
  try {
    const supabase = await createClient();

    // Get the currently authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "Not authenticated." };
    }

    // Update auth password via admin API (does not invalidate current session)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    if (authError) throw authError;

    // Find the coordinator record via profile_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return { success: false, message: "Profile not found." };
    }

    // Set is_active = true using supabaseAdmin to bypass RLS (FR-3.1.17)
    const { error: updateError } = await supabaseAdmin
      .from("coordinators")
      .update({ is_active: true })
      .eq("profile_id", profile.id);

    if (updateError) throw updateError;

    // Write audit log
    await writeAuditLog("activate_coordinator", {
      table_name: "coordinators",
      description: "Coordinator activated after forced password change",
    });

    revalidatePath("/coordinator/dashboard");

    return { success: true };
  } catch (error) {
    console.error("activateCoordinator error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to activate coordinator.";
    return { success: false, message };
  }
}
