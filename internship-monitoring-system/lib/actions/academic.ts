"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/services/admin/audit";

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("create_school_year", { table_name: "school_years", record_id: schoolYear.id, description: `Created school year: ${data.name}` });

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("update_school_year", { table_name: "school_years", record_id: id, description: `Updated school year` });

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("delete_school_year", { table_name: "school_years", record_id: id, description: `Deleted school year` });

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

    // Deactivate ALL school years
    const { error: deactivateAllYears } = await supabase
      .from("school_years")
      .update({ is_active: false })
      .neq("id", schoolYearId);

    if (deactivateAllYears) throw deactivateAllYears;

    // Deactivate ALL semesters across all school years
    const { error: deactivateAllSemesters } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .neq("school_year_id", schoolYearId);

    if (deactivateAllSemesters) throw deactivateAllSemesters;

    // Also deactivate semesters under the target year before re-activating only the latest
    const { error: deactivateTargetSemesters } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .eq("school_year_id", schoolYearId);

    if (deactivateTargetSemesters) throw deactivateTargetSemesters;

    // Activate the target school year
    const { error: activateTarget } = await supabase
      .from("school_years")
      .update({ is_active: true })
      .eq("id", schoolYearId);

    if (activateTarget) throw activateTarget;

    // Find and activate the latest semester (by start_date) under this school year
    const { data: latestSemester, error: fetchSemError } = await supabase
      .from("semesters")
      .select("id")
      .eq("school_year_id", schoolYearId)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    if (fetchSemError) throw fetchSemError;

    if (latestSemester) {
      const { error: activateSemError } = await supabase
        .from("semesters")
        .update({ is_active: true })
        .eq("id", latestSemester.id);

      if (activateSemError) throw activateSemError;
    }

    revalidatePath("/admin/registration/archive-list");
    revalidatePath("/admin/dashboard");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("set_active_school_year", { table_name: "school_years", record_id: schoolYearId, description: `Set active school year` });

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("create_semester", { table_name: "semesters", record_id: semester.id, description: `Created semester: ${data.name}` });

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("update_semester", { table_name: "semesters", record_id: id, description: `Updated semester` });

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

    // Write audit log (FR 3.2.7)
    await writeAuditLog("delete_semester", { table_name: "semesters", record_id: id, description: `Deleted semester` });

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

export async function setActiveSemester(semesterId: string) {
  try {
    const supabase = await createClient();

    // Get the school year for this semester
    const { data: semester, error: fetchError } = await supabase
      .from("semesters")
      .select("school_year_id")
      .eq("id", semesterId)
      .single();

    if (fetchError || !semester) throw fetchError ?? new Error("Semester not found");

    // Deactivate ALL semesters across all school years
    const { error: deactivateAllSemesters } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .neq("id", semesterId);

    if (deactivateAllSemesters) throw deactivateAllSemesters;

    // Deactivate ALL school years
    const { error: deactivateAllYears } = await supabase
      .from("school_years")
      .update({ is_active: false })
      .neq("id", semester.school_year_id);

    if (deactivateAllYears) throw deactivateAllYears;

    // Activate the target semester
    const { error: activateSemError } = await supabase
      .from("semesters")
      .update({ is_active: true })
      .eq("id", semesterId);

    if (activateSemError) throw activateSemError;

    // Activate the parent school year
    const { error: activateYearError } = await supabase
      .from("school_years")
      .update({ is_active: true })
      .eq("id", semester.school_year_id);

    if (activateYearError) throw activateYearError;

    revalidatePath("/admin/registration/archive-list");
    revalidatePath("/admin/registration/archive-list/semester-list");
    revalidatePath("/admin/dashboard");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("set_active_semester", { table_name: "semesters", record_id: semesterId, description: `Set active semester` });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to set active semester.",
    };
  }
}

export async function deactivateSchoolYear(schoolYearId: string) {
  try {
    const supabase = await createClient();

    // Deactivate the school year
    const { error: deactivateYearError } = await supabase
      .from("school_years")
      .update({ is_active: false })
      .eq("id", schoolYearId);

    if (deactivateYearError) throw deactivateYearError;

    // Deactivate all semesters under this school year
    const { error: deactivateSemestersError } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .eq("school_year_id", schoolYearId);

    if (deactivateSemestersError) throw deactivateSemestersError;

    revalidatePath("/admin/registration/archive-list");
    revalidatePath("/admin/registration/archive-list/semester-list");
    revalidatePath("/admin/dashboard");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("deactivate_school_year", { table_name: "school_years", record_id: schoolYearId, description: `Deactivated school year` });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to deactivate school year.",
    };
  }
}

export async function deactivateSemester(semesterId: string) {
  try {
    const supabase = await createClient();

    // Get the parent school year
    const { data: semester, error: fetchError } = await supabase
      .from("semesters")
      .select("school_year_id")
      .eq("id", semesterId)
      .single();

    if (fetchError || !semester) throw fetchError ?? new Error("Semester not found");

    // Deactivate the semester
    const { error: deactivateError } = await supabase
      .from("semesters")
      .update({ is_active: false })
      .eq("id", semesterId);

    if (deactivateError) throw deactivateError;

    // Deactivate the parent school year
    const { error: deactivateYearError } = await supabase
      .from("school_years")
      .update({ is_active: false })
      .eq("id", semester.school_year_id);

    if (deactivateYearError) throw deactivateYearError;

    revalidatePath("/admin/registration/archive-list");
    revalidatePath("/admin/registration/archive-list/semester-list");
    revalidatePath("/admin/dashboard");

    // Write audit log (FR 3.2.7)
    await writeAuditLog("deactivate_semester", { table_name: "semesters", record_id: semesterId, description: `Deactivated semester` });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to deactivate semester.",
    };
  }
}
