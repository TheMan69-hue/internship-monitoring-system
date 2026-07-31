"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createHTEAction(data: {
  company_name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .insert({
        company_name: data.company_name,
        address: data.address,
        contact_person: data.contact_person,
        contact_number: data.contact_number,
        email: data.email,
        status: "Active",
      });

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create HTE.",
    };
  }
}

export async function updateHTEAction(
  hteId: string,
  data: {
    company_name: string;
    address: string;
    contact_person: string;
    contact_number: string;
    email: string;
  }
) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .update({
        company_name: data.company_name,
        address: data.address,
        contact_person: data.contact_person,
        contact_number: data.contact_number,
        email: data.email,
      })
      .eq("id", hteId);

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update HTE.",
    };
  }
}

export async function deleteHTEAction(hteId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("hte_companies")
      .delete()
      .eq("id", hteId);

    if (error) {
      throw error;
    }

    revalidatePath("/coordinator/hte-management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete HTE.",
    };
  }
}

export async function fetchHTECompanies(
  _filters?: { year?: string; semester?: string }
) {
  try {
    let query = supabaseAdmin
      .from("hte_companies")
      .select(`
        id,
        company_name,
        address,
        contact_person,
        contact_number,
        email,
        status,
        gps_coordinates
      `);

    query = query.order("company_name", { ascending: true });

    // Filter HTE companies by semester through students(hte_id → semester_id)
    if (_filters?.semester) {
      const { data: studentHTEs } = await supabaseAdmin
        .from("students")
        .select("hte_id")
        .eq("semester_id", _filters.semester)
        .not("hte_id", "is", null);

      const hteIds = [
        ...new Set((studentHTEs ?? []).map((s) => s.hte_id).filter(Boolean)),
      ];

      if (hteIds.length > 0) {
        query = query.in("id", hteIds);
      } else {
        query = query.in("id", []);
      }
    }

    const { data: htes, error: hteError } = await query;

    if (hteError) throw hteError;

    // Count interns per HTE (filtered by semester if provided)
    let internQuery = supabaseAdmin
      .from("students")
      .select("hte_id")
      .not("hte_id", "is", null);

    if (_filters?.semester) {
      internQuery = internQuery.eq("semester_id", _filters.semester);
    }

    const { data: students, error: studentError } = await internQuery;

    if (studentError) throw studentError;

    const internCounts = new Map<string, number>();
    for (const student of students ?? []) {
      const count = internCounts.get(student.hte_id) ?? 0;
      internCounts.set(student.hte_id, count + 1);
    }

    return (htes ?? []).map((hte) => ({
      id: hte.id,
      company: hte.company_name,
      address: hte.address ?? "",
      contactPerson: hte.contact_person,
      email: hte.email,
      phone: hte.contact_number,
      workSchedule: null,
      workingHours: null,
      currentInterns: internCounts.get(hte.id) ?? 0,
    }));
  } catch (error) {
    console.error("fetchHTECompanies error:", error);
    throw error;
  }
}
