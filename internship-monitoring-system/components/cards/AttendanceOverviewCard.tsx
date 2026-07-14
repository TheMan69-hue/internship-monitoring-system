type AttendanceOverviewCardProps = {
  present: number;
  late: number;
  absent: number;
};

export default function AttendanceOverviewCard({
  present,
  late,
  absent,
}: AttendanceOverviewCardProps) {

  return (

    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-[#E5E7EB]">

      <h2 className="mb-4 text-lg font-semibold text-[#111827]">
        Attendance Overview
      </h2>


      <div className="space-y-3">


        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-600">
            Present
          </span>

          <span className="font-semibold text-[#111827]">
            {present}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-600">
            Late
          </span>

          <span className="font-semibold text-[#111827]">
            {late}
          </span>
        </div>

        <div className="flex justify-between ">
          <span className="text-gray-600">
            Absent
          </span>

          <span className="font-semibold text-[#111827]">
            {absent}
          </span>
        </div>

      </div>
    </div>
  );
}