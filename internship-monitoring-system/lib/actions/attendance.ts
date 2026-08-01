"use server";

import { revalidatePath } from "next/cache";

import { approveAttendance } from "@/lib/services/coordinator/approveAttendance";
import { rejectAttendance } from "@/lib/services/coordinator/rejectAttendance";

export async function approveAttendanceAction(
  attendanceId: string
) {
  try {
    await approveAttendance(attendanceId);

    revalidatePath("/coordinator/student-management/attendance-logs");
    revalidatePath("/admin/attendance-review");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to approve attendance.",
    };
  }
}

export async function rejectAttendanceAction(
  attendanceId: string
) {
  try {
    await rejectAttendance(attendanceId);

    revalidatePath("/coordinator/student-management/attendance-logs");
    revalidatePath("/admin/attendance-review");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reject attendance.",
    };
  }
}