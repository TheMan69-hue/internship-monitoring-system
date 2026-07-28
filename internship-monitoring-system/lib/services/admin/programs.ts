import { createClient } from "@/lib/supabase/client";
import type { Program } from "@/lib/types";

type DbProgram = {
  id: string;
  program_name: string;
  required_hours: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getPrograms(
  _filters?: { year?: string; semester?: string }
): Promise<Program[]> {
  const supabase = createClient();

  let query = supabase
    .from("programs")
    .select("id, program_name, required_hours, created_at, updated_at");

  // NOTE: programs table doesn't have school_year_id/semester_id columns yet.
  // Uncomment these once those columns exist:
  // if (filters?.year) {
  //   query = query.eq("school_year_id", filters.year);
  // }
  // if (filters?.semester) {
  //   query = query.eq("semester_id", filters.semester);
  // }

  query = query.order("created_at", { ascending: true });

  const { data: programsData, error: programsError } = await query;

  if (programsError) {
    throw programsError;
  }

  const programIds = (programsData ?? []).map((p) => p.id);

  const [{ data: studentCounts }, { data: coordinatorCounts }] =
    await Promise.all([
      supabase
        .from("students")
        .select("program_id")
        .in("program_id", programIds),
      supabase
        .from("coordinator_assignments")
        .select("program_id")
        .in("program_id", programIds),
    ]);

  const studentsByProgram = new Map<string, number>();
  (studentCounts ?? []).forEach((row) => {
    studentsByProgram.set(
      row.program_id,
      (studentsByProgram.get(row.program_id) ?? 0) + 1
    );
  });

  const coordinatorsByProgram = new Map<string, number>();
  (coordinatorCounts ?? []).forEach((row) => {
    coordinatorsByProgram.set(
      row.program_id,
      (coordinatorsByProgram.get(row.program_id) ?? 0) + 1
    );
  });

  return (programsData ?? []).map((program) => {
    const p = program as unknown as DbProgram;
    return {
      id: p.id ?? "",
      name: p.program_name ?? "Unnamed Program",
      required_hours: p.required_hours ?? 0,
      Total_Interns: studentsByProgram.get(p.id) ?? 0,
      Total_Coordinator: coordinatorsByProgram.get(p.id) ?? 0,
    };
  });
}
