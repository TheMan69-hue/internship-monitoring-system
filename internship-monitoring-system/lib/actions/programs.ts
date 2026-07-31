"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/services/admin/audit";

export async function createProgram(data: {
  program_name: string;
  required_hours: number;
}) {
  try {
    const supabase = await createClient();

    const { data: program, error } = await supabase
      .from("programs")
      .insert({
        program_name: data.program_name,
        required_hours: data.required_hours,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list/program-list");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("create_program", { table_name: "programs", record_id: program.id, description: `Created program: ${data.program_name}` });

    return { success: true, data: program };
  } catch (error) {
    console.error("createProgram error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : "Failed to create program.";
    return { success: false, message };
  }
}

export async function updateProgram(
  id: string,
  data: { program_name?: string; required_hours?: number }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("programs")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list/program-list");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("update_program", { table_name: "programs", record_id: id, description: `Updated program` });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update program.",
    };
  }
}

export async function deleteProgram(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list/program-list");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("delete_program", { table_name: "programs", record_id: id, description: `Deleted program` });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete program.",
    };
  }
}
