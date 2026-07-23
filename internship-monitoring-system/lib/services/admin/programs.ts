import { createClient } from "@/lib/supabase/client";
import type { Program } from "@/lib/types";

export async function getPrograms(): Promise<Program[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("id, program_name, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((program) => ({
    id: Number(program.id) || 0,
    name: program.program_name ?? "Unnamed Program",
    required_hours: 0,
    Total_Interns: 0,
    Total_Coordinator: 0,
  }));
}
