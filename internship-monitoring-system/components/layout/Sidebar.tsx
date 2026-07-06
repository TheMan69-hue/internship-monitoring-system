"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { coordinatorMenu } from "@/lib/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
export default function Sidebar() {
  const [studentOpen, setStudentOpen] = useState(false);
  const pathname = usePathname();
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
          {coordinatorMenu.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            return (
              <li key={item.title}>
                <button
                  onClick={() => setStudentOpen(!studentOpen)}
                  className={`group flex items-center justify-between w-full rounded-[10px] px-4 py-3 transition-all duration-200 ${
                    pathname.startsWith("/coordinator/student-management")
                      ? "bg-[#D9D9D9] text-[#000000]"
                      : "text-[#000000] hover:bg-[#D9D9D9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        className={`text-[#000000] transition-transform duration-200 ${
                          pathname.startsWith("/coordinator/student-management")
                            ? "scale-110"
                            : "group-hover:scale-110"
                        }`}
                      />
                      <span
                        className={`transition-transform duration-200 ${
                          pathname.startsWith("/coordinator/student-management")
                            ? "scale-105"
                            : ""
                        } group-hover:scale-105`}
                      >
                        {item.title}
                      </span>
                  </div>

                  {studentOpen ? (
                    <ChevronDown
                      size={18}
                      className="text-[#000000] transition-transform duration-200"
                    />
                  ) : (
                    <ChevronRight
                      size={18}
                      className="text-[#000000] transition-transform duration-200"
                    />
                  )}
                </button>

                {(studentOpen || pathname.startsWith("/coordinator/student-management")) && (
                  <ul className="ml-10 mt-2 space-y-2">
                    {item.children.map((child) => (
                      <li key={child.title}>
                        <Link
                          href={child.href}
                          className={`group block rounded-[8px] px-3 py-2 transition-all duration-200 ${
                            pathname === child.href
                              ? "bg-[#D9D9D9] text-[#000000]"
                              : "text-[#000000] hover:bg-[#ECECEC]"
                          }`}
                        >
                          <span
                            className={`block transition-transform duration-200 ${
                              pathname === child.href ? "scale-105" : "group-hover:scale-105"
                            }`}
                          >
                            {child.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

  return (
    <li key={item.title}>
      <Link
          href={item.href!}
          className={`group flex items-center gap-3 rounded-[10px] px-4 py-3 transition-all duration-200 ${
            pathname === item.href
              ? "bg-[#D9D9D9] text-[#000000]"
              : "text-[#000000] hover:bg-[#D9D9D9]"
          }`}
        >
          <Icon
            size={20}
            className={`transition-transform duration-200 ${
              pathname === item.href ? "scale-110" : "group-hover:scale-110"
            }`}
          />

          <span
            className={`transition-transform duration-200 ${
              pathname === item.href ? "scale-105" : "group-hover:scale-105"
            }`}
          >
            {item.title}
          </span>
        </Link>
        </li>
      );
    })}
        </ul>
      </nav>

      {/* Logout */}
      {/* Logout */}
      <div className="p-4 border-t">
        <button className="w-full rounded-[20px] bg-[#CDCDCD] py-2 text-[#000000] hover:bg-[#696969] transition-colors duration-200">
          Logout
        </button>
      </div>
    </aside>
  );
}