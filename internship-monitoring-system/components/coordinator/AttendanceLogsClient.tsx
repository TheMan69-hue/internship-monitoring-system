"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SearchInput from "@/components/search/SearchInput";
import DataTable from "@/components/table/DataTable";
import AttendanceDetailsModal from "@/components/modals/AttendanceDetailsModal";
import ReviewAttendanceModal from "@/components/modals/ReviewAttendanceModal";
import { attendanceColumns } from "@/lib/data/attendance";
import type { AttendanceGroup } from "@/lib/types";
import {
  approveAttendanceAction,
  rejectAttendanceAction,
} from "@/lib/actions/attendance";
type AttendanceLogsClientProps = {
  attendanceLogs: AttendanceGroup[];
};

const PAGE_SIZE = 10;

export default function AttendanceLogsClient({
  attendanceLogs,
}: AttendanceLogsClientProps) {
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceGroup | null>(null);
  const [reviewAttendance, setReviewAttendance] =
    useState<AttendanceGroup | null>(null);
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagedAttendance = filteredAttendance.slice(startIdx, startIdx + PAGE_SIZE);

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
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setPage(1);
              }}
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
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search student number or name..."
        />
      </div>

      <DataTable columns={attendanceColumns}>
        {pagedAttendance.map((student) => {
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

              <td className="px-6 py-4">
                {latestAttendance.flaggedForReview ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewAttendance(student);
                    }}
                    className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 hover:bg-yellow-200"
                  >
                    To Review
                  </button>
                ) : (
                  <span
                    className={`font-medium ${
                      latestAttendance.status === "Present"
                        ? "text-green-600"
                        : latestAttendance.status === "Late"
                        ? "text-orange-500"
                        : latestAttendance.status === "Incomplete"
                        ? "text-red-600"
                        : "text-[#374151]"
                    }`}
                  >
                    {latestAttendance.status}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#374151]">
          Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filteredAttendance.length)} of {filteredAttendance.length} students
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-[#374151]">
            {safePage} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
          >
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

      {reviewAttendance && (
        <ReviewAttendanceModal
          attendance={reviewAttendance.latestAttendance}
          onClose={() => setReviewAttendance(null)}
          onApprove={async () => {
            const result = await approveAttendanceAction(
              reviewAttendance.latestAttendance.id
            );

            if (result.success) {
              setReviewAttendance(null);
              router.refresh();
            } else {
              alert(result.message);
            }
          }}
          onReject={async () => {
            const result = await rejectAttendanceAction(
              reviewAttendance.latestAttendance.id
            );

            if (result.success) {
              setReviewAttendance(null);
              router.refresh();
            } else {
              alert(result.message);
            }
          }}
        />
      )}
    </div>
  );
}