import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AttendanceLog } from "@/lib/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateTime: string | null) {
  if (!dateTime) return null;

  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type AttendanceWithStudent = {
  id: string;
  student_id: string;
  date: string;
  status: string;
  flagged_for_review: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  time_in: string | null;
  time_out: string | null;
  location: string | null;
  location_name_in: string | null;

  students: {
    student_number: string;
    name: string;

    program: {
      program_name: string;
    } | null;

    section: {
      section_name: string;
    } | null;

    hte_companies_map: {
      id: string;
      company_name: string;
      gps_coordinates: string | null;
    } | null;
  };
};

type AttendanceGroup = {
  studentId: string;
  studentNumber: string;
  studentName: string;
  program: string;
  section: string;
  hte: string;
  latestAttendance: AttendanceLog;
  attendanceHistory: AttendanceLog[];
};

export type InternProgressItem = {
  studentId: string;
  studentNumber: string;
  studentName: string;
  program: string;
  section: string;
  totalLogs: number;
  presentCount: number;
  lateCount: number;
  incompleteCount: number;
  flaggedCount: number;
  attendanceRate: number;
  latestStatus: string;
};

type AttendanceScope = "coordinator" | "admin";

async function getCurrentUserContext() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  if (profile.role !== "admin" && profile.role !== "coordinator") {
    throw new Error("Only admin or coordinator accounts can review attendance.");
  }

  return { supabase, profile };
}

async function getAttendanceRecords(scope: AttendanceScope) {
  const { supabase, profile } = await getCurrentUserContext();

  if (scope === "coordinator") {
    const { data: coordinator, error: coordinatorError } = await supabase
      .from("coordinators")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (coordinatorError || !coordinator) {
      throw new Error("Coordinator not found");
    }

    const { data: assignments, error: assignmentError } = await supabase
      .from("coordinator_assignments")
      .select("program_id, section_id")
      .eq("coordinator_id", coordinator.id);

    if (assignmentError) {
      throw assignmentError;
    }

    if (!assignments || assignments.length === 0) {
      return [];
    }

    const programIds = assignments.map((item) => item.program_id);
    const sectionIds = assignments.map((item) => item.section_id);

    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id")
      .in("program_id", programIds)
      .in("section_id", sectionIds);

    if (studentError) {
      throw studentError;
    }

    if (!students || students.length === 0) {
      return [];
    }

    const studentIds = students.map((student) => student.id);

    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance_logs")
      .select(`
        id,
        student_id,
        date,
        status,
        flagged_for_review,
        reviewed_by,
        reviewed_at,
        time_in,
        time_out,
        location,
        location_name_in,

        students!inner(
          student_number,
          name,
          program:programs(program_name),
          section:sections(section_name),
          hte_companies_map!students_hte_id_fkey(
            id,
            company_name,
            gps_coordinates
          )
        )
      `)
      .in("student_id", studentIds)
      .order("date", { ascending: false });

    if (attendanceError) {
      throw attendanceError;
    }

    return (attendance ?? []) as unknown as AttendanceWithStudent[];
  }

  const { data: attendance, error: attendanceError } = await supabaseAdmin
    .from("attendance_logs")
    .select(`
      id,
      student_id,
      date,
      status,
      flagged_for_review,
      reviewed_by,
      reviewed_at,
      time_in,
      time_out,
      location,
      location_name_in,
      students!inner(
        id,
        student_number,
        name,
        program_id,
        section_id,
        hte_id,
        program:programs(program_name),
        section:sections(section_name),
        hte_companies_map!students_hte_id_fkey(
          id,
          company_name,
          gps_coordinates
        )
      )
    `)
    .order("date", { ascending: false });

  if (attendanceError) {
    throw attendanceError;
  }

  return (attendance ?? []) as unknown as AttendanceWithStudent[];
}

export function buildAttendanceGroups(records: AttendanceWithStudent[]) {
  const mappedAttendance = records.map((record) => ({
    id: record.id,
    studentId: record.student_id,
    studentNumber: record.students.student_number,
    studentName: record.students.name,
    program: record.students.program?.program_name ?? "Unknown",
    section: record.students.section?.section_name ?? "Unknown",
    hte: record.students.hte_companies_map?.company_name ?? "Not Assigned",
    date: formatDate(record.date),
    rawDate: record.date,
    timeIn: formatTime(record.time_in),
    timeOut: formatTime(record.time_out),
    location: record.location_name_in,
    status: record.status,
    flaggedForReview: record.flagged_for_review,
    reviewedBy: record.reviewed_by,
    reviewedAt: record.reviewed_at,
    gpsCoordinates: record.students.hte_companies_map?.gps_coordinates ?? null,
  }));

  const grouped = new Map<string, AttendanceGroup>();

  for (const attendance of mappedAttendance) {
    if (!grouped.has(attendance.studentId)) {
      grouped.set(attendance.studentId, {
        studentId: attendance.studentId,
        studentNumber: attendance.studentNumber,
        studentName: attendance.studentName,
        program: attendance.program,
        section: attendance.section,
        hte: attendance.hte,
        latestAttendance: attendance,
        attendanceHistory: [],
      });
    }

    grouped.get(attendance.studentId)!.attendanceHistory.push(attendance);
  }

  return Array.from(grouped.values());
}

export async function getAssignedAttendance() {
  const records = await getAttendanceRecords("coordinator");
  return buildAttendanceGroups(records);
}

export async function getAllAttendance() {
  const records = await getAttendanceRecords("admin");
  return buildAttendanceGroups(records);
}

export async function getFlaggedAttendanceForAdmin() {
  const { data, error } = await supabaseAdmin
    .from("attendance_logs")
    .select(`
      id,
      student_id,
      date,
      status,
      flagged_for_review,
      reviewed_by,
      reviewed_at,
      time_in,
      time_out,
      location_name_in,
      students!inner(
        student_number,
        name,
        program:programs(program_name),
        section:sections(section_name)
      )
    `)
    .eq("flagged_for_review", true)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AttendanceWithStudent[];
}

export async function getAdminInternProgress(): Promise<InternProgressItem[]> {
  const { supabase, profile } = await getCurrentUserContext();

  if (profile.role !== "admin") {
    throw new Error("Admin access required.");
  }

  const { data, error } = await supabase
    .from("attendance_logs")
    .select(`
      id,
      status,
      flagged_for_review,
      date,
      student_id,
      students!inner(
        student_number,
        name,
        program:programs(program_name),
        section:sections(section_name)
      )
    `)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  const grouped = new Map<string, InternProgressItem>();

  for (const record of data ?? []) {
    const studentId = record.student_id;
    const studentRecord = Array.isArray(record.students) ? record.students[0] : record.students;
    const studentName = studentRecord?.name ?? "Unknown";
    const studentNumber = studentRecord?.student_number ?? "Unknown";
    const program = "Unknown";
    const section = "Unknown";

    if (!grouped.has(studentId)) {
      grouped.set(studentId, {
        studentId,
        studentNumber,
        studentName,
        program,
        section,
        totalLogs: 0,
        presentCount: 0,
        lateCount: 0,
        incompleteCount: 0,
        flaggedCount: 0,
        attendanceRate: 0,
        latestStatus: "No records",
      });
    }

    const item = grouped.get(studentId)!;
    item.totalLogs += 1;

    const canonicalStatus = String(record.status ?? "").toLowerCase();
    if (canonicalStatus === "present") {
      item.presentCount += 1;
    } else if (canonicalStatus === "late") {
      item.lateCount += 1;
    } else if (canonicalStatus === "incomplete") {
      item.incompleteCount += 1;
    }

    if (record.flagged_for_review) {
      item.flaggedCount += 1;
    }

    if (item.latestStatus === "No records") {
      item.latestStatus = record.status ?? "No records";
    }
  }

  return Array.from(grouped.values()).map((item) => {
    const attendanceRate = item.totalLogs > 0
      ? Math.round(((item.presentCount + item.lateCount) / item.totalLogs) * 100)
      : 0;

    return {
      ...item,
      attendanceRate,
    };
  });
}

export async function getAttendanceSummary() {
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();

  if(!user){
    throw new Error("User not authenticated");
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const {
    data,
    error
  } = await supabase
    .from("attendance_logs")
    .select(`
      status,
      date,
      students!inner(
        program,
        section
      )
    `)
    .eq(
      "date",
      today
    );

  if(error){
    throw error;
  }

  const summary = {
    present:0,
    late:0,
    absent:0
  };

  data.forEach((record)=>{
    const status = record.status.toLowerCase();

    if(status === "present"){
      summary.present++;
    }

    if(status === "late"){
      summary.late++;
    }

    if(status === "absent"){
      summary.absent++;
    }

  });


  return summary;

}