"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createCoordinator(data: {
  name: string;
  email: string;
  contact_num: string;
  password: string;
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
    let sections: { id: string; program_id: string }[] = [];
    if (data.section_ids.length > 0) {
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("id, program_id")
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

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
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

    const { data: coordinator, error: coordinatorError } = await supabase
      .from("coordinators")
      .insert({
        profile_id: profile.id,
        employee_number: data.contact_num,
        department: null,
      })
      .select()
      .single();

    if (coordinatorError) throw coordinatorError;

    if (data.section_ids.length > 0) {
      const assignments = (sections ?? []).map((section) => ({
        coordinator_id: coordinator.id,
        section: section.id,
        program: section.program_id,
      }));

      const { error: assignmentError } = await supabase
        .from("coordinator_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;
    }

    revalidatePath("/admin/ojt-coordinator");

    return { success: true };
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
      const { error: deleteError } = await supabase
        .from("coordinator_assignments")
        .delete()
        .eq("coordinator_id", coordinatorId);

      if (deleteError) throw deleteError;

      if (data.section_ids.length > 0) {
        // Fetch program_id for each selected section
        const { data: sections, error: sectionsError } = await supabase
          .from("sections")
          .select("id, program_id")
          .in("id", data.section_ids);

        if (sectionsError) throw sectionsError;

        const assignments = (sections ?? []).map((section) => ({
          coordinator_id: coordinatorId,
          section: section.id,
          program: section.program_id,
        }));

        const { error: insertError } = await supabase
          .from("coordinator_assignments")
          .insert(assignments);

        if (insertError) throw insertError;
      }
    }

    revalidatePath("/admin/ojt-coordinator");

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
    const { error: assignmentError } = await supabase
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
