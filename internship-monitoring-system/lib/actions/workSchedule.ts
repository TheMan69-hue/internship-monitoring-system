"use server";

import { updateStudentWorkSchedule } from "@/lib/services/coordinator/workSchedule";

export async function saveStudentWorkSchedule(
  studentId: string,
  expectedTimeIn: string,
  expectedTimeOut: string,
  requiredHours: number
) {
  return await updateStudentWorkSchedule(
    studentId,
    expectedTimeIn,
    expectedTimeOut,
    requiredHours
  );
}