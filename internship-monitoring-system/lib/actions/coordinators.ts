"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/services/admin/audit";

/**
 * Generates a cryptographically random alphanumeric string of the given length.
 * Uses the Web Crypto API (available globally in Node.js 19+).
 */
function generateTempPassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export async function createCoordinator(data: {
  name: string;
  email: string;
  contact_num: string;
  section_ids: string[];
}) {
  try {
    const supabase = await createClient();

    // === Pre-validation before creating anything ===

    // 1. Check for duplicate employee_number
    const { data: existingCoordinator } = await supabase
      .from("coordinators")
      .select("id")
      .eq("employee_number", data.contact_num)
      .maybeSingle();

    if (existingCoordinator) {
      return {
        success: false,
        message: "A coordinator with this contact/employee number already exists.",
      };
    }

    // 2. Check that selected sections exist and have program_ids
    let sections: { id: string; program_id: string; section_name: string }[] = [];
    if (data.section_ids.length > 0) {
      const { data: sectionData, error: sectionError } = await supabaseAdmin
        .from("sections")
        .select("id, program_id, section_name")
        .in("id", data.section_ids);

      if (sectionError) throw sectionError;

      if (!sectionData || sectionData.length !== data.section_ids.length) {
        return {
          success: false,
          message: "One or more selected sections were not found.",
        };
      }

      const missingProgram = sectionData.find((s) => !s.program_id);
      if (missingProgram) {
        return {
          success: false,
          message: `Section ${missingProgram.id} has no program assigned.`,
        };
      }

      sections = sectionData;
    }

    // === All validations passed, proceed with creation ===

    // FR-3.1.12: Auto-generate a temporary password using Web Crypto API
    const tempPassword = generateTempPassword();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { display_name: data.name, full_name: data.name },
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: authData.user.id,
        full_name: data.name,
        email: data.email,
        role: "coordinator",
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (profileError) throw profileError;

    // FR-3.1.14: Account starts in inactive state
    const { data: coordinator, error: coordinatorError } = await supabase
      .from("coordinators")
      .insert({
        profile_id: profile.id,
        employee_number: data.contact_num,
        department: null,
        is_active: false,
      })
      .select()
      .single();

    if (coordinatorError) throw coordinatorError;

    // Write audit log (FR 3.2.7)
    await writeAuditLog("create_coordinator", { table_name: "coordinators", record_id: coordinator.id, description: `Created coordinator: ${data.name}` });

    if (data.section_ids.length > 0) {
      // Fetch program names for the unique program_ids
      const programIds = [...new Set(sections.map((s) => s.program_id))];
      const { data: programs } = await supabaseAdmin
        .from("programs")
        .select("id, program_name")
        .in("id", programIds);

      const programMap = new Map((programs ?? []).map((p) => [p.id, p.program_name]));

      const assignments = (sections ?? []).map((section) => ({
        coordinator_id: coordinator.id,
        section: section.section_name,
        program: programMap.get(section.program_id) ?? "Unknown Program",
        section_id: section.id,
        program_id: section.program_id,
      }));

      const { error: assignmentError } = await supabaseAdmin
        .from("coordinator_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;
    }

    revalidatePath("/admin/ojt-coordinator");

    // Return the temp password so the UI can display it once (FR-3.1.13)
    return { success: true, tempPassword };
  } catch (error) {
    console.error("createCoordinator error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to create coordinator.";
    return { success: false, message };
  }
}

export async function updateCoordinator(
  coordinatorId: string,
  data: {
    name?: string;
    contact_num?: string;
    section_ids?: string[];
  }
) {
  try {
    const supabase = await createClient();

    // Fetch coordinator + profile (include user_id for auth update)
    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      throw new Error("Coordinator not found.");
    }

    // Get profile's user_id for auth update
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", coordinator.profile_id)
      .single();

    if (profileFetchError || !profile) {
      throw new Error("Profile not found.");
    }

    if (data.name) {
      // Update auth user metadata (display name)
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.user_id,
        { user_metadata: { display_name: data.name, full_name: data.name } }
      );
      if (authError) throw authError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: data.name })
        .eq("id", coordinator.profile_id);

      if (profileError) throw profileError;
    }

    if (data.contact_num) {
      const { error: coordError } = await supabase
        .from("coordinators")
        .update({ employee_number: data.contact_num })
        .eq("id", coordinatorId);

      if (coordError) throw coordError;
    }

    if (data.section_ids !== undefined) {
      const { error: deleteError } = await supabaseAdmin
        .from("coordinator_assignments")
        .delete()
        .eq("coordinator_id", coordinatorId);

      if (deleteError) throw deleteError;

      if (data.section_ids.length > 0) {
        // Fetch section names and program_ids for each selected section
        const { data: sections, error: sectionsError } = await supabaseAdmin
          .from("sections")
          .select("id, program_id, section_name")
          .in("id", data.section_ids);

        if (sectionsError) throw sectionsError;

        // Fetch program names for the unique program_ids
        const programIds = [...new Set((sections ?? []).map((s) => s.program_id))];
        const { data: programs } = await supabaseAdmin
          .from("programs")
          .select("id, program_name")
          .in("id", programIds);

        const programMap = new Map((programs ?? []).map((p) => [p.id, p.program_name]));

        const assignments = (sections ?? []).map((section) => ({
          coordinator_id: coordinatorId,
          section: section.section_name,
          program: programMap.get(section.program_id) ?? "Unknown Program",
          section_id: section.id,
          program_id: section.program_id,
        }));

        const { error: insertError } = await supabaseAdmin
          .from("coordinator_assignments")
          .insert(assignments);

        if (insertError) throw insertError;
      }
    }

    revalidatePath("/admin/ojt-coordinator");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("update_coordinator", { table_name: "coordinators", record_id: coordinatorId, description: `Updated coordinator` });

    return { success: true };
  } catch (error) {
    console.error("updateCoordinator error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to update coordinator.";
    return { success: false, message };
  }
}

export async function deleteCoordinator(coordinatorId: string) {
  try {
    const supabase = await createClient();

    // Fetch coordinator + profile (include user_id for auth deletion)
    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      throw new Error("Coordinator not found.");
    }

    // Get profile's user_id before deleting
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", coordinator.profile_id)
      .single();

    if (profileFetchError || !profile) {
      throw new Error("Profile not found.");
    }

    // Delete auth user first (requires admin)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      profile.user_id
    );
    if (authError) throw authError;

    // Delete assignments
    const { error: assignmentError } = await supabaseAdmin
      .from("coordinator_assignments")
      .delete()
      .eq("coordinator_id", coordinatorId);

    if (assignmentError) throw assignmentError;

    // Delete coordinator record
    const { error: coordError } = await supabase
      .from("coordinators")
      .delete()
      .eq("id", coordinatorId);

    if (coordError) throw coordError;

    // Delete profile (cascade should handle this, but explicit to be safe)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", coordinator.profile_id);

    if (profileError) throw profileError;

    revalidatePath("/admin/ojt-coordinator");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("delete_coordinator", { table_name: "coordinators", record_id: coordinatorId, description: `Deleted coordinator` });

    return { success: true };
  } catch (error) {
    console.error("deleteCoordinator error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to delete coordinator.";
    return { success: false, message };
  }
}

/**
 * Resets a coordinator's password to a new auto-generated temporary password.
 * Sets is_active = false so they must complete the force-change flow again.
 * Returns the temp password for one-time display to the admin.
 */
export async function resetCoordinatorPassword(coordinatorId: string) {
  try {
    const supabase = await createClient();

    // Fetch coordinator + profile (include user_id for auth update)
    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      return { success: false, message: "Coordinator not found." };
    }

    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", coordinator.profile_id)
      .single();

    if (profileFetchError || !profile) {
      return { success: false, message: "Profile not found." };
    }

    // Generate new temp password
    const newPassword = generateTempPassword();

    // Update auth password via admin API
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { password: newPassword }
    );
    if (authError) throw authError;

    // Reset is_active to false
    const { error: updateError } = await supabase
      .from("coordinators")
      .update({ is_active: false })
      .eq("id", coordinatorId);

    if (updateError) throw updateError;

    await writeAuditLog("reset_coordinator_password", {
      table_name: "coordinators",
      record_id: coordinatorId,
      description: "Coordinator password was reset by admin",
    });

    return { success: true, tempPassword: newPassword };
  } catch (error) {
    console.error("resetCoordinatorPassword error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to reset coordinator password.";
    return { success: false, message };
  }
}

/**
 * Generates a new temporary password for a coordinator WITHOUT deactivating
 * their account. Unlike resetCoordinatorPassword, this does NOT set
 * is_active = false, so the coordinator can continue working without
 * being forced to change their password on next login.
 * Returns the temp password for one-time display to the admin.
 */
export async function regenerateCoordinatorPassword(coordinatorId: string) {
  try {
    const supabase = await createClient();

    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      return { success: false, message: "Coordinator not found." };
    }

    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", coordinator.profile_id)
      .single();

    if (profileFetchError || !profile) {
      return { success: false, message: "Profile not found." };
    }

    // Generate new temp password
    const newPassword = generateTempPassword();

    // Update auth password via admin API only — no is_active change
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { password: newPassword }
    );
    if (authError) throw authError;

    await writeAuditLog("regenerate_coordinator_password", {
      table_name: "coordinators",
      record_id: coordinatorId,
      description: "Coordinator password was regenerated by admin (no deactivation)",
    });

    return { success: true, tempPassword: newPassword };
  } catch (error) {
    console.error("regenerateCoordinatorPassword error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to regenerate coordinator password.";
    return { success: false, message };
  }
}
