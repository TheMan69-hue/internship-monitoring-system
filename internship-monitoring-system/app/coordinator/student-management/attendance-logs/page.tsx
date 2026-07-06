"use client";

import SearchBar from "@/components/search/SearchBar";
import { useState } from "react";

import DataTable from "@/components/table/DataTable";

import {
  attendanceColumns,
  attendanceLogs,
} from "@/lib/attendance";

import type { AttendanceLog } from "@/lib/types";

import AttendanceDetailsModal from "@/components/modals/AttendanceDetailsModal";
export default function AttendanceLogsPage() {
    const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceLog | null>(null);
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

            <select className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]">
              <option>All</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Section
            </label>

            <select className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]">
              <option>All</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Date
            </label>

            <input
              type="date"
              className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
            />
          </div>

        </div>
        <SearchBar />
      </div>

        <DataTable columns={attendanceColumns}>

                {attendanceLogs.map((attendance) => (

                    <tr
                    key={attendance.id}
                    onClick={() => setSelectedAttendance(attendance)}
                    className="cursor-pointer border-t transition-colors hover:bg-[#F3F4F6]"
                    >

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.studentNumber}
                    </td>

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.studentName}
                    </td>

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.hte}
                    </td>

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.date}
                    </td>

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.timeIn}
                    </td>

                    <td className="px-6 py-4 text-[#374151]">
                        {attendance.timeOut}
                    </td>

                    </tr>

                ))}

        </DataTable>
        
        <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#374151]">
                Showing 1 to 3 of 3 entries
            </p>

            <div className="flex items-center gap-2">

                <button
                className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]"
                >
                Prev
                </button>

                <button
                className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]"
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

    </div>
  );
}