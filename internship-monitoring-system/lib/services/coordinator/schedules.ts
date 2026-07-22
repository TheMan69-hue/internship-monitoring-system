import { createClient } from "@/lib/supabase/server";

export async function getStudentSchedule(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_schedules")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

type SaveScheduleInput = {
  studentId: string;
  expectedTimeIn: string;
  expectedTimeOut: string;
  requiredHours: number;
  graceMinutes: number;
};

export async function saveStudentSchedule(
  schedule: SaveScheduleInput
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_schedules")
    .upsert({
      student_id: schedule.studentId,
      expected_time_in: schedule.expectedTimeIn,
      expected_time_out: schedule.expectedTimeOut,
      required_hours: schedule.requiredHours,
      grace_minutes: schedule.graceMinutes,
    });

  if (error) {
    throw error;
  }
}