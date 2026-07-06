import { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
};

export default function DashboardCard({
  title,
  value,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm border border-[#E5E7EB]">

      <div className="flex items-center justify-between">

        <h2 className="text-[#6B7280] text-sm font-medium">
          {title}
        </h2>

        <Icon
          size={22}
          className="text-[#6B7280]"
        />

      </div>

      <p className="mt-5 text-4xl font-bold text-[#111827]">
        {value}
      </p>

    </div>
  );
}