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
  // NOTE: These tables don't have school_year_id/semester_id columns yet.
  // Uncomment the lines below once those columns are added to filter by academic period:
  // if (filters?.year) {
  //   studentRegQuery = studentRegQuery.eq("school_year_id", filters.year);
  //   pendingQuery = pendingQuery.eq("school_year_id", filters.year);
  //   studentsCountQuery = studentsCountQuery.eq("school_year_id", filters.year);
  //   studentsSummaryQuery = studentsSummaryQuery.eq("school_year_id", filters.year);
  // }
  // if (filters?.semester) {
  //   studentRegQuery = studentRegQuery.eq("semester_id", filters.semester);
  //   pendingQuery = pendingQuery.eq("semester_id", filters.semester);
  //   studentsCountQuery = studentsCountQuery.eq("semester_id", filters.semester);
  //   studentsSummaryQuery = studentsSummaryQuery.eq("semester_id", filters.semester);
  // }

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
