import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getStudentWorkSchedule(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_work_schedules")
    .select(`
      expected_time_in,
      expected_time_out,
      required_hours
    `)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStudentWorkSchedule(
  studentId: string,
  expectedTimeIn: string,
  expectedTimeOut: string,
  requiredHours: number
) {
  const { error } = await supabaseAdmin
    .from("student_work_schedules")
    .upsert(
      {
        student_id: studentId,
        expected_time_in: expectedTimeIn,
        expected_time_out: expectedTimeOut,
        required_hours: requiredHours,
      },
      {
        onConflict: "student_id",
      }
    );

  if (error) {
    throw error;
  }

  return true;
}