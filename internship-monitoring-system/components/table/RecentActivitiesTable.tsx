const recentActivities = [
  {
    name: "Juan Dela Cruz",
    studentId: "2024-0001",
    status: "IN",
  },
  {
    name: "Maria Santos",
    studentId: "2024-0002",
    status: "OUT",
  },
  {
    name: "John Reyes",
    studentId: "2024-0003",
    status: "IN",
  },
  {
    name: "Anna Cruz",
    studentId: "2024-0004",
    status: "IN",
  },
];

export default function RecentActivitiesTable() {
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-xl font-semibold text-[#374151]">
        Recent Activities
      </h2>
      <div className="max-h-[430px] overflow-y-auto">
        <table className="w-full">
          <thead>

            <tr className="border-b">

              <th className="pb-3 text-left text-[#374151]">
                Name
              </th>

              <th className="pb-3 text-left text-[#374151]">
                Student ID
              </th>

              <th className="pb-3 text-center text-[#374151]">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {recentActivities.map((student) => (

              <tr
                key={student.studentId}
                className="hover:bg-gray-50 transition-colors"
              >

                <td className="py-4 text-[#374151]">
                  {student.name}
                </td>

                <td className="text-[#374151]">
                  {student.studentId}
                </td>

                <td className="text-center">

                  <span
                    className={`inline-flex min-w-[70px] justify-center rounded-full px-3 py-1 text-sm font-semibold text-white ${
                      student.status === "IN"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}