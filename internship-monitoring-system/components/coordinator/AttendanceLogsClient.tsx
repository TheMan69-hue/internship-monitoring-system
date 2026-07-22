"use client";

import { useState } from "react";

import SearchInput from "@/components/search/SearchInput";
import DataTable from "@/components/table/DataTable";
import AttendanceDetailsModal from "@/components/modals/AttendanceDetailsModal";

import { attendanceColumns } from "@/lib/data/attendance";
import type { AttendanceGroup } from "@/lib/types";

type AttendanceLogsClientProps = {
  attendanceLogs: AttendanceGroup[];
};

export default function AttendanceLogsClient({
  attendanceLogs,
}: AttendanceLogsClientProps) {
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceGroup | null>(null);

  const [selectedProgram, setSelectedProgram] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [search, setSearch] = useState("");

  const programs = [
    "All",
    ...new Set(attendanceLogs.map((student) => student.program)),
  ];

  const sections = [
    "All",
    ...new Set(attendanceLogs.map((student) => student.section)),
  ];

  const filteredAttendance = attendanceLogs.filter((student) => {
    const matchesProgram =
      selectedProgram === "All" ||
      student.program === selectedProgram;

    const matchesSection =
      selectedSection === "All" ||
      student.section === selectedSection;

    const matchesSearch =
      search === "" ||
      student.studentName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.studentNumber
        .toLowerCase()
        .includes(search.toLowerCase());

    return (
      matchesProgram &&
      matchesSection &&
      matchesSearch
    );
  });

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Attendance Logs
      </h2>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Program
            </label>

            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
            >
              {programs.map((program) => (
                <option
                  key={program}
                  value={program}
                >
                  {program}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Section
            </label>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
            >
              {sections.map((section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search student number or name..."
        />
      </div>

      <DataTable columns={attendanceColumns}>
        {filteredAttendance.map((student) => {
          const latestAttendance = student.attendanceHistory[0];

          return (
            <tr
              key={student.studentId}
              onClick={() => setSelectedAttendance(student)}
              className="cursor-pointer border-t transition-colors hover:bg-[#F3F4F6]"
            >
              <td className="px-6 py-4 text-[#374151]">
                {student.studentNumber}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {student.studentName}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {student.hte}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {latestAttendance.date}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {latestAttendance.timeIn}
              </td>

              <td className="px-6 py-4 text-[#374151]">
                {latestAttendance.timeOut}
              </td>
            </tr>
          );
        })}
      </DataTable>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#374151]">
          Showing {filteredAttendance.length} of {attendanceLogs.length} students
        </p>

        <div className="flex items-center gap-2">
          <button className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]">
            Prev
          </button>

          <button className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]">
            Next
          </button>
        </div>
      </div>

      {selectedAttendance && (
        <AttendanceDetailsModal
          attendance={selectedAttendance}
          onClose={() => setSelectedAttendance(null)}
        />
      )}
    </div>
  );
}