import { createClient } from "@/lib/supabase/client";
import type { Coordinator } from "@/lib/types";

export async function getCoordinators(
  _filters?: { year?: string; semester?: string }
): Promise<Coordinator[]> {
  const supabase = createClient();

  let query = supabase
    .from("coordinators")
    .select("id, profile_id, employee_number, department, is_active, created_at");

  // NOTE: coordinators table doesn't have school_year_id/semester_id columns yet.
  // Uncomment these once those columns exist:
  // if (_filters?.semester) {
  //   query = query.eq("semester_id", _filters.semester);
  // }

  query = query.order("created_at", { ascending: true });

  const { data: coordinatorsData, error: coordinatorsError } = await query;

  if (coordinatorsError) {
    throw coordinatorsError;
  }

  const profileIds = (coordinatorsData ?? [])
    .map((item) => item.profile_id)
    .filter((value): value is string => Boolean(value));

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", profileIds);

  if (profilesError) {
    throw profilesError;
  }

  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [profile.id, profile])
  );

  const coordinatorIds = (coordinatorsData ?? []).map((c) => c.id).filter(Boolean);

  // Fetch assigned sections for all coordinators
  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from("coordinator_assignments")
    .select("coordinator_id, section_id")
    .in("coordinator_id", coordinatorIds);

  if (assignmentsError) {
    throw assignmentsError;
  }

  const sectionsByCoordinator = new Map<string, string[]>();
  (assignmentsData ?? []).forEach((a) => {
    const existing = sectionsByCoordinator.get(a.coordinator_id) ?? [];
    if (a.section_id) existing.push(a.section_id);
    sectionsByCoordinator.set(a.coordinator_id, existing);
  });

  return (coordinatorsData ?? []).map((coordinator) => {
    const profile = coordinator.profile_id
      ? profilesById.get(coordinator.profile_id)
      : undefined;

    return {
      id: coordinator.id ?? "",
      name: profile?.full_name ?? "Unnamed Coordinator",
      email: profile?.email ?? "",
      contact_num: coordinator.employee_number ?? coordinator.department ?? "",
      role: "coordinator",
      password: "",
      is_active: coordinator.is_active ?? false,
      created_at: coordinator.created_at ?? undefined,
      sections: sectionsByCoordinator.get(coordinator.id) ?? [],
    } satisfies Coordinator;
  });
}

export async function getSectionOptions(): Promise<{ id: string; name: string }[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("sections")
    .select("id, section_name")
    .order("section_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((section) => ({
    id: section.id ?? "",
    name: section.section_name ?? "Unnamed Section",
  }));
}
