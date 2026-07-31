import { createClient } from "@/lib/supabase/client";

export type AdminDashboardStats = {
  registeredStudents: number;
  pendingApprovals: number;
  approvedInterns: number;
  ojtCoordinators: number;
  registeredHTE: number;
  studentSummary: { program: string; count: number }[];
};

export async function getAdminDashboardStats(
  _filters?: { year?: string; semester?: string }
): Promise<AdminDashboardStats> {
  const supabase = createClient();

  // Build base queries that can be extended with filters
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

  // Apply Supabase-side filters when provided
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

export type AuditLogEntry = {
  date: string;
  time: string;
  user_id: string;
  action: string;
  status?: string;
};

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("date, time, user_id, action, status")
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(20);

  if (error) {
    return [];
  }

  return (data ?? []) as AuditLogEntry[];
}
