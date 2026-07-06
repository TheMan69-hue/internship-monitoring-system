import Sidebar from "./Sidebar";
import Header from "./Header";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#D9D9D9]">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Header />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}