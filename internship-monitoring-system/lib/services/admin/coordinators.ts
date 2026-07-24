import { createClient } from "@/lib/supabase/client";
import type { Coordinator } from "@/lib/types";

export async function getCoordinators(): Promise<Coordinator[]> {
  const supabase = createClient();

  const { data: coordinatorsData, error: coordinatorsError } = await supabase
    .from("coordinators")
    .select("id, profile_id, employee_number, department, created_at")
    .order("created_at", { ascending: true });

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
      is_active: true,
      created_at: coordinator.created_at ?? undefined,
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
