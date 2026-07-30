"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminDashboardStats = {
  registeredStudents: number;
  pendingApprovals: number;
  approvedInterns: number;
  ojtCoordinators: number;
  registeredHTE: number;
  studentSummary: { program: string; count: number }[];
};

/**
 * Fetches admin dashboard statistics.
 * Uses supabaseAdmin (service role) to bypass RLS restrictions.
 * Filters by semester when provided.
 */
export async function getAdminDashboardStatsAction(
  _filters?: { year?: string; semester?: string }
): Promise<AdminDashboardStats> {
  const supabase = supabaseAdmin;

  // ── Build base queries ──
  let studentRegQuery = supabase
    .from("student_registrations")
    .select("*", { count: "exact", head: true });

  let pendingQuery = supabase
    .from("student_registrations")
    .select("*", { count: "exact", head: true })
    .eq("status", "Pending");

  let studentsCountQuery = supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  let coordinatorsQuery = supabase
    .from("coordinators")
    .select("*", { count: "exact", head: true });

  let hteQuery = supabase
    .from("hte_companies")
    .select("*", { count: "exact", head: true });

  let studentsSummaryQuery = supabase
    .from("students")
    .select("program:programs(program_name)");

  // ── Apply filters when semester is provided ──
  if (_filters?.semester) {
    // students table has semester_id column
    studentsCountQuery = studentsCountQuery.eq("semester_id", _filters.semester);
    studentsSummaryQuery = studentsSummaryQuery.eq("semester_id", _filters.semester);

    // hte_companies: filter through students(hte_id → semester_id)
    const { data: hteIdsData } = await supabase
      .from("students")
      .select("hte_id")
      .eq("semester_id", _filters.semester)
      .not("hte_id", "is", null);

    const uniqueHteIds = [
      ...new Set((hteIdsData ?? []).map((s) => s.hte_id).filter(Boolean)),
    ];

    if (uniqueHteIds.length > 0) {
      hteQuery = hteQuery.in("id", uniqueHteIds);
    } else {
      hteQuery = hteQuery.in("id", []);
    }
  }

  // ── Execute all queries in parallel ──
  const [
    { count: registeredStudents },
    { count: pendingApprovals },
    { count: approvedInterns },
    { count: ojtCoordinators },
    { count: registeredHTE },
    { data: students },
  ] = await Promise.all([
    studentRegQuery,
    pendingQuery,
    studentsCountQuery,
    coordinatorsQuery,
    hteQuery,
    studentsSummaryQuery,
  ]);

  // ── Build student summary by program ──
  const programCounts = new Map<string, number>();

  (students ?? []).forEach((student) => {
    const programData = student.program as unknown;
    const programName =
      (Array.isArray(programData)
        ? (programData[0] as { program_name: string } | undefined)?.program_name
        : (programData as { program_name: string } | null)?.program_name) ?? "Unknown";
    programCounts.set(programName, (programCounts.get(programName) ?? 0) + 1);
  });

  const studentSummary = Array.from(programCounts.entries())
    .map(([program, count]) => ({ program, count }))
    .sort((a, b) => b.count - a.count);

  return {
    registeredStudents: registeredStudents ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    approvedInterns: approvedInterns ?? 0,
    ojtCoordinators: ojtCoordinators ?? 0,
    registeredHTE: registeredHTE ?? 0,
    studentSummary,
  };
}
