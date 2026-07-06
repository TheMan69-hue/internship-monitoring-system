import type { ElementType } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
} from "lucide-react";

export interface NavigationChild {
  title: string;
  href: string;
}

export interface NavigationItem {
  title: string;
  icon: ElementType;
  href?: string;
  children?: NavigationChild[];
}

export const coordinatorMenu: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/coordinator/dashboard",
  },
  {
    title: "Student Management",
    icon: Users,
    children: [
      {
        title: "Registration List",
        href: "/coordinator/student-management/registration-list",
      },
      {
        title: "Student List",
        href: "/coordinator/student-management/student-list",
      },
      {
        title: "Attendance Logs",
        href: "/coordinator/student-management/attendance-logs",
      },
    ],
  },
  {
    title: "HTE Management",
    icon: Building2,
    href: "/coordinator/hte-management",
  },
];