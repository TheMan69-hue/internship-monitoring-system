type DashboardSummaryCardProps = {
  title: string;
};

export default function DashboardSummaryCard({
  title,
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm border border-[#E5E7EB]">

      <h2 className="mb-4 text-lg font-semibold text-[#111827]">
        {title}
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between border-b pb-2 text-[#374151]">
          <span>BSCS</span>
          <span className="font-semibold">114</span>
        </div>

        <div className="flex justify-between border-b pb-2 text-[#374151]">
          <span>BSIT</span>
          <span className="font-semibold">130</span>
        </div>

        <div className="flex justify-between text-[#374151]">
          <span>BSCE</span>
          <span className="font-semibold">98</span>
        </div>

      </div>

    </div>
  );
}