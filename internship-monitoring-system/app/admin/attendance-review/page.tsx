import AttendanceLogsClient from "@/components/coordinator/AttendanceLogsClient";
import { getFlaggedAttendanceForAdmin } from "@/lib/services/coordinator/attendance";
import { buildAttendanceGroups } from "@/lib/services/coordinator/attendance";

export default async function AdminAttendanceReviewPage() {
  const attendanceLogs = await getFlaggedAttendanceForAdmin();
  const groupedAttendanceLogs = buildAttendanceGroups(attendanceLogs);

  return (
    <main className="flex flex-1 flex-col p-5">
      <AttendanceLogsClient
        attendanceLogs={groupedAttendanceLogs}
        title="Attendance Review"
        subtitle="Review flagged attendance logs across all interns as an admin."
      />
    </main>
  );
}
