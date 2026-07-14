type RecentActivity = {
  id: string;
  status: string;
  time_in: string | null;
  time_out: string | null;
  date: string;
  students: {
    name: string;
    student_number: string;
  } | null;
};

type RecentActivitiesTableProps = {
  activities: RecentActivity[];
};

export default function RecentActivitiesTable({
  activities,
}: RecentActivitiesTableProps) {

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

            {activities.map((activity) => (

              <tr
                key={activity.id}
                className="hover:bg-gray-50 transition-colors"
              >

                <td className="py-4 text-[#374151]">
                  {activity.students?.name ?? "Unknown"}
                </td>


                <td className="text-[#374151]">
                  {activity.students?.student_number ?? "N/A"}
                </td>


                <td className="text-center">

                  <span
                    className={`inline-flex min-w-[70px] justify-center rounded-full px-3 py-1 text-sm font-semibold text-white ${
                      activity.time_out
                      ? "bg-red-500"
                      : "bg-green-500"
                    }`}
                  >
                    {activity.time_out ? "OUT" : "IN"}
                  </span>

                </td>

              </tr>

            ))}


            {activities.length === 0 && (

              <tr>

                <td
                  colSpan={3}
                  className="py-6 text-center text-[#6B7280]"
                >
                  No recent activities
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}