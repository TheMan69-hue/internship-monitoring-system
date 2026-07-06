import RecentActivitiesTable from "@/components/table/RecentActivitiesTable";
import DashboardSummaryCard from "@/components/cards/DashboardSummaryCard";
import DashboardCard from "@/components/cards/DashboardCard";
import SearchBar from "@/components/search/SearchBar";
import { dashboardStats } from "@/lib/dashboard";

export default function CoordinatorDashboardPage() {
  return (
    <div>

      <div className="mb-6 flex justify-end">
        <SearchBar />
      </div>

      <div className="grid grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <RecentActivitiesTable />
        </div>
        <div className="flex flex-col gap-6">
          <DashboardSummaryCard
            title="Students by Program"
          />
          <DashboardSummaryCard
            title="Students by Section"
          />
        </div>
      </div>
    </div>
    
  );
}