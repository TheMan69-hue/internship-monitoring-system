import AttendanceLogsClient from "@/components/coordinator/AttendanceLogsClient";
import { getAssignedAttendance } from "@/lib/services/coordinator/attendance";

export default async function AttendanceLogsPage() {
  const attendanceLogs = await getAssignedAttendance();

  return (
    <AttendanceLogsClient
      attendanceLogs={attendanceLogs}
    />
  );
}