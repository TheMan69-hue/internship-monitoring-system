"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

    return { success: true, data: program };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create program.",
    };
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
