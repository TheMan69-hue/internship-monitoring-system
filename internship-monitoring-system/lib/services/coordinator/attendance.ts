import { createClient } from "@/lib/supabase/server";
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

export async function getAssignedAttendance() {
  const supabase = await createClient();

  // Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get profile
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  // Get coordinator
  const {
    data: coordinator,
    error: coordinatorError,
  } = await supabase
    .from("coordinators")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (coordinatorError || !coordinator) {
    throw new Error("Coordinator not found");
  }

  // Get coordinator assignments
  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from("coordinator_assignments")
    .select(`
      program_id,
      section_id
    `)
    .eq("coordinator_id", coordinator.id);

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignments || assignments.length === 0) {
    return [];
  }

  const programIds = assignments.map((item) => item.program_id);
  const sectionIds = assignments.map((item) => item.section_id);

  // Get assigned students
  const {
    data: students,
    error: studentError,
  } = await supabase
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

  // Get attendance logs
  const {
    data: attendance,
    error: attendanceError,
  } = await supabase
    .from("attendance_logs")
    .select(`
      id,
      student_id,
      date,
      status,
      time_in,
      time_out,
      location,
      location_name_in,

      students!inner(
        student_number,
        name,

        program:programs(
          program_name
        ),

        section:sections(
          section_name
        ),

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

  const mappedAttendance = (
    (attendance ?? []) as unknown as AttendanceWithStudent[]
  ).map((record) => ({
    id: record.id,
    studentId: record.student_id,
    studentNumber: record.students.student_number,
    studentName: record.students.name,
    program: record.students.program?.program_name ?? "Unknown",
    section: record.students.section?.section_name ?? "Unknown",
    hte:  record.students.hte_companies_map?.company_name ?? "Not Assigned",
    date: formatDate(record.date),
    rawDate: record.date,
    timeIn: formatTime(record.time_in),
    timeOut: formatTime(record.time_out),
    location: record.location_name_in,
    status: record.status,
    gpsCoordinates:
      record.students.hte_companies_map?.gps_coordinates ?? null,
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