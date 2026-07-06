export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-[#000000]">
          Internship Monitoring System
        </h1>

        <p className="text-sm text-[#000000] ">
          OJT Coordinator
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">

        <ul className="space-y-2">

          <li>
            <button className="w-full rounded-lg px-4 py-2 text-left text-[#000000] hover:bg-[#D9D9D9]">
              Dashboard
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-2 text-left text-[#000000] hover:bg-[#D9D9D9]">
              Student Management
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-2 text-left text-[#000000] hover:bg-[#D9D9D9]">
              HTE Management
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-2 text-left text-[#000000] hover:bg-[#D9D9D9]">
              Reports
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-2 text-left text-[#000000] hover:bg-[#D9D9D9]">
              Settings
            </button>
          </li>

        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t rounded-b-lg">
        <button className="w-full rounded-lg bg-[#CDCDCD] text-[#000000] py-2 hover:bg-[#696969]">
          Logout
        </button>
      </div>
    </aside>
  );
}