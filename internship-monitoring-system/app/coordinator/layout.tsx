import DashboardLayout from "@/components/layout/DashboardLayout";
import ForcePasswordChangeGuard from "./ForcePasswordChangeGuard";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForcePasswordChangeGuard />
      <DashboardLayout>{children}</DashboardLayout>
    </>
  );
}