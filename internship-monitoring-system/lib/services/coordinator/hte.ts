import { createClient } from "@/lib/supabase/server";

type HTEWithCount = {
  id: string;
  company_name: string;
  address: string | null;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  status: string;
  gps_coordinates: string | null;
  currentInterns: number;
};

export async function getHTEList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const {
    data: htes,
    error: hteError,
  } = await supabase
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
    `)
    .order("company_name", { ascending: true });

  if (hteError) {
    throw hteError;
  }

  const {
    data: students,
    error: studentError,
  } = await supabase
    .from("students")
    .select("hte_id")
    .not("hte_id", "is", null);

  if (studentError) {
    throw studentError;
  }

  const internCounts = new Map<string, number>();
  for (const student of students ?? []) {
    const count = internCounts.get(student.hte_id) ?? 0;
    internCounts.set(student.hte_id, count + 1);
  }

  const mapped: HTEWithCount[] = (htes ?? []).map((hte) => ({
    id: hte.id,
    company_name: hte.company_name,
    address: hte.address,
    contact_person: hte.contact_person,
    contact_number: hte.contact_number,
    email: hte.email,
    status: hte.status,
    gps_coordinates: hte.gps_coordinates,
    currentInterns: internCounts.get(hte.id) ?? 0,
  }));

  return mapped;
}
