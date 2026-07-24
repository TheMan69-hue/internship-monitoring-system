"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createCoordinator(data: {
  name: string;
  email: string;
  contact_num: string;
  password: string;
  section_ids: number[];
}) {
  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user.");

    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: authData.user.id,
        full_name: data.name,
        email: data.email,
        role: "coordinator",
      })
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
      const assignments = data.section_ids.map((sectionId) => ({
        coordinator_id: coordinator.id,
        section_id: sectionId,
      }));

      const { error: assignmentError } = await supabase
        .from("coordinator_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;
    }

    revalidatePath("/admin/ojt-coordinator");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create coordinator.",
    };
  }
}

export async function updateCoordinator(
  coordinatorId: string,
  data: {
    name?: string;
    contact_num?: string;
    section_ids?: number[];
  }
) {
  try {
    const supabase = await createClient();

    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      throw new Error("Coordinator not found.");
    }

    if (data.name || data.contact_num) {
      const profileUpdate: Record<string, unknown> = {};
      if (data.name) profileUpdate.full_name = data.name;

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
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
    }

    if (data.section_ids !== undefined) {
      const { error: deleteError } = await supabase
        .from("coordinator_assignments")
        .delete()
        .eq("coordinator_id", coordinatorId);

      if (deleteError) throw deleteError;

      if (data.section_ids.length > 0) {
        const assignments = data.section_ids.map((sectionId) => ({
          coordinator_id: coordinatorId,
          section_id: sectionId,
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
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update coordinator.",
    };
  }
}

export async function deleteCoordinator(coordinatorId: string) {
  try {
    const supabase = await createClient();

    const { data: coordinator, error: fetchError } = await supabase
      .from("coordinators")
      .select("id, profile_id")
      .eq("id", coordinatorId)
      .single();

    if (fetchError || !coordinator) {
      throw new Error("Coordinator not found.");
    }

    const { error: assignmentError } = await supabase
      .from("coordinator_assignments")
      .delete()
      .eq("coordinator_id", coordinatorId);

    if (assignmentError) throw assignmentError;

    const { error: coordError } = await supabase
      .from("coordinators")
      .delete()
      .eq("id", coordinatorId);

    if (coordError) throw coordError;

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", coordinator.profile_id);

    if (profileError) throw profileError;

    revalidatePath("/admin/ojt-coordinator");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete coordinator.",
    };
  }
}
