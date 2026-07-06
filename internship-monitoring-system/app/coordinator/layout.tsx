import DashboardLayout from "@/components/layout/DashboardLayout";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}