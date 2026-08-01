import { getAdminInternProgress } from "@/lib/services/coordinator/attendance";

export default async function AdminInternProgressPage() {
  const progress = await getAdminInternProgress();

  return (
    <main className="flex flex-1 flex-col p-5">
      <div className="rounded-[20px] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-[#111827]">Intern Progress</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Monitor attendance trends and flagged records for each intern.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <table className="min-w-full divide-y divide-[#E5E7EB] text-sm">
            <thead className="bg-[#F9FAFB] text-left text-[#374151]">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Logs</th>
                <th className="px-4 py-3 font-semibold">Present</th>
                <th className="px-4 py-3 font-semibold">Late</th>
                <th className="px-4 py-3 font-semibold">Incomplete</th>
                <th className="px-4 py-3 font-semibold">Flagged</th>
                <th className="px-4 py-3 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {progress.map((item) => (
                <tr key={item.studentId} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{item.studentName}</div>
                    <div className="text-xs text-[#6B7280]">{item.studentNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-[#374151]">{item.program}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.section}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.totalLogs}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.presentCount}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.lateCount}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.incompleteCount}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.flaggedCount}</td>
                  <td className="px-4 py-3 text-[#374151]">{item.attendanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
