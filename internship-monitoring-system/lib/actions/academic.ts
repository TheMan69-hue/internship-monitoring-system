"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSchoolYear(data: {
  name: string;
  start_date: string;
  end_date: string;
}) {
  try {
    const supabase = await createClient();

    const { data: schoolYear, error } = await supabase
      .from("school_years")
      .insert({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true, data: schoolYear };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create school year.",
    };
  }
}

export async function updateSchoolYear(
  id: string,
  data: { name?: string; start_date?: string; end_date?: string }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("school_years")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update school year.",
    };
  }
}

export async function deleteSchoolYear(id: string) {
  try {
    const supabase = await createClient();

    const { error: semesterError } = await supabase
      .from("semesters")
      .delete()
      .eq("school_year_id", id);

    if (semesterError) throw semesterError;

    const { error } = await supabase
      .from("school_years")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete school year.",
    };
  }
}

export async function setActiveSchoolYear(schoolYearId: string) {
  try {
    const supabase = await createClient();

    const { error: deactivateAll } = await supabase
      .from("school_years")
      .update({ is_active: false })
      .neq("id", schoolYearId);

    if (deactivateAll) throw deactivateAll;

    const { error: deactivateSemesters } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .neq("school_year_id", schoolYearId);

    if (deactivateSemesters) throw deactivateSemesters;

    const { error: activateTarget } = await supabase
      .from("school_years")
      .update({ is_active: true })
      .eq("id", schoolYearId);

    if (activateTarget) throw activateTarget;

    const { error: activateSemesters } = await supabase
      .from("semesters")
      .update({ is_active: true })
      .eq("school_year_id", schoolYearId);

    if (activateSemesters) throw activateSemesters;

    revalidatePath("/admin/registration/archive-list");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to set active school year.",
    };
  }
}

export async function createSemester(data: {
  school_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
}) {
  try {
    const supabase = await createClient();

    const { data: semester, error } = await supabase
      .from("semesters")
      .insert({
        school_year_id: data.school_year_id,
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true, data: semester };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create semester.",
    };
  }
}

export async function updateSemester(
  id: string,
  data: { name?: string; start_date?: string; end_date?: string }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("semesters")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update semester.",
    };
  }
}

export async function deleteSemester(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("semesters")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/registration/archive-list");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete semester.",
    };
  }
}
