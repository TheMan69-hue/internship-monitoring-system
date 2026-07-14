import RecentActivitiesTable from "@/components/table/RecentActivitiesTable";
import DashboardCard from "@/components/cards/DashboardCard";
import AttendanceOverviewCard from "@/components/cards/AttendanceOverviewCard";
import SearchBar from "@/components/search/SearchBar";
import { getRecentActivities } from "@/lib/services/coordinator/recentActivities";
import { getDashboardStats } from "@/lib/services/coordinator/dashboard";
import { getAttendanceSummary } from "@/lib/services/coordinator/attendance";

import {
  Users,
  Building2,
  UserX,
  Clock,
} from "lucide-react";

export default async function CoordinatorDashboardPage() {
  const dashboard = await getDashboardStats();  
  const attendance = await getAttendanceSummary();
  const activities = await getRecentActivities();
  const dashboardStats = [

    {
      title: "Total Students",
      value: dashboard.totalStudents,
      icon: Users,
    },


    {
      title: "Total HTE",
      value: dashboard.totalHTE,
      icon: Building2,
    },


    {
      title: "Students Without HTE",
      value: dashboard.studentsWithoutHTE,
      icon: UserX,
    },


    {
      title: "Pending Internship",
      value: dashboard.pendingInternship,
      icon: Clock,
    },

  ];

  return (

    <div>

      <div className="mb-6 flex justify-end">

        <SearchBar />

      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-4 gap-6">


        {dashboardStats.map((stat)=> (

          <DashboardCard

            key={stat.title}

            title={stat.title}

            value={stat.value}

            icon={stat.icon}

          />

        ))}

      </div>

      {/* Main Dashboard Content */}

      <div className="mt-8 grid grid-cols-4 gap-6">

        {/* Recent Activities */}

        <div className="col-span-3">

          <RecentActivitiesTable activities={activities}/>

        </div>

        {/* Attendance Overview */}

        <div>

          <AttendanceOverviewCard

            present={attendance.present}

            late={attendance.late}

            absent={attendance.absent}

          />

        </div>
      </div>
    </div>

  );

}