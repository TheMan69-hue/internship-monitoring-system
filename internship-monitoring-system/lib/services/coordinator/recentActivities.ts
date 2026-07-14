import { createClient } from "@/lib/supabase/server";

type RecentActivity = {
  id: string;
  status: string;
  time_in: string | null;
  time_out: string | null;
  date: string;
  created_at: string;
  students: {
    name: string;
    student_number: string;
  } | null;
};

type AttendanceResponse = {
  id: string;
  status: string;
  time_in: string | null;
  time_out: string | null;
  date: string;
  created_at: string;
  students:
    | {
        name: string;
        student_number: string;
      }
    | {
        name: string;
        student_number: string;
      }[]
    | null;
};

export async function getRecentActivities() {
  const supabase = await createClient();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const {
    data,
    error
  } = await supabase
    .from("attendance_logs")
    .select(`
      id,
      status,
      time_in,
      time_out,
      date,
      created_at,
      students(
        name,
        student_number
      )
    `)
    .eq(
      "date",
      today
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {
    throw error;
  }

  const activities = (data ?? []) as AttendanceResponse[];

  const latestActivities = new Map<string, RecentActivity>();

  activities.forEach((activity) => {

    const student = Array.isArray(activity.students)
      ? activity.students[0]
      : activity.students;

    const studentNumber = student?.student_number;

    if (
      studentNumber &&
      !latestActivities.has(studentNumber)
    ) {
      latestActivities.set(
        studentNumber,
        {
          id: activity.id,
          status: activity.status,
          time_in: activity.time_in,
          time_out: activity.time_out,
          date: activity.date,
          created_at: activity.created_at,
          students: student ?? null
        }
      );
    }

  });

  return Array.from(
    latestActivities.values()
  );
}