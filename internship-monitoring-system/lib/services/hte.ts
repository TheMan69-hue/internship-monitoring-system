import { createClient } from "@/lib/supabase/server";
import type { HTE } from "@/lib/types";

export async function getHTEs(): Promise<HTE[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hte_companies")
    .select("*")
    .order("company_name", { ascending: true });

  if (error) {
    console.error("Error fetching HTEs:", error);
    throw new Error("Failed to fetch HTEs.");
  }

  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("hte_id");

  if (studentError) {
    console.error("Error fetching students:", studentError);
    throw new Error("Failed to fetch students.");
  }

  return data.map((hte) => ({
    id: String(hte.id),
    company: hte.company_name,
    address: hte.address ?? "",
    contactPerson: hte.contact_person,
    email: hte.email,
    phone: hte.contact_number,
    workSchedule: hte.work_schedule,
    workingHours: hte.working_hours,
    currentInterns:
      students?.filter(
        (student) => String(student.hte_id) === String(hte.id)
      ).length ?? 0,
  }));
}

export async function addHTE(data: {
  company: string;
  address: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  workSchedule: string | null;
  workingHours: string | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hte_companies")
    .insert({
      company_name: data.company,
      address: data.address,
      contact_person: data.contactPerson,
      contact_number: data.phone,
      email: data.email,
      work_schedule: data.workSchedule,
      working_hours: data.workingHours,
      status: "Active",
    });

  if (error) {
    console.error("Error adding HTE:", error);
    throw error;
  }
}

export async function updateHTE(data: {
  id: string;
  company: string;
  address: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  workSchedule: string | null;
  workingHours: string | null;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hte_companies")
    .update({
      company_name: data.company,
      address: data.address,
      contact_person: data.contactPerson,
      contact_number: data.phone,
      email: data.email,
      work_schedule: data.workSchedule,
      working_hours: data.workingHours,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (error) {
    console.error("Error updating HTE:", error);
    throw error;
  }
}

export async function deleteHTE(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hte_companies")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting HTE:", error);
    throw error;
  }
}