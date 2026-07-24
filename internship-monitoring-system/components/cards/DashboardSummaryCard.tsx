type DashboardSummaryCardProps = {
  title: string;
  data?: { program: string; count: number }[];
};

export default function DashboardSummaryCard({
  title,
  data = [],
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-[#E5E7EB]">

      <h2 className="mb-4 text-lg font-semibold text-[#111827]">
        {title}
      </h2>

      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No data available</p>
        ) : (
          data.map((item) => (
            <div
              key={item.program}
              className="flex justify-between border-b pb-2 text-[#374151] last:border-b-0"
            >
              <span>{item.program}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
