"use client";

import Modal from "./Modal";
import type { AttendanceLog } from "@/lib/types";
import { useMemo, useState } from "react";

type AttendanceHistoryModalProps = {
  studentName: string;
  history: AttendanceLog[];
  onClose: () => void;
};

export default function AttendanceHistoryModal({
  studentName,
  history,
  onClose,
}: AttendanceHistoryModalProps) {
    const [selectedDate, setSelectedDate] = useState("");

    const filteredHistory = useMemo(() => {
        if (!selectedDate) return history;

        return history.filter(
            (attendance) => attendance.rawDate === selectedDate
        );
    }, [history, selectedDate]);
  return (
    <Modal
      title={`${studentName} - Attendance History`}
      onClose={onClose}
    >
      <div className="p-6">

        {/* Date Filter */}
        <div className="mb-4 flex items-end justify-between">

            <div>
                <label className="mb-1 block text-sm text-[#374151]">
                Filter by Date
                </label>

                <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#111827]"
                />
            </div>

            <button
                onClick={() => setSelectedDate("")}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm text-[#374151] transition hover:bg-[#F3F4F6]"
            >
                Clear Filter
            </button>

        </div>

        {/* Scrollable Table */}
        <p className="mb-3 text-sm text-[#6B7280]">
            Showing {filteredHistory.length} of {history.length} attendance record(s)
        </p>
        <div className="max-h-[400px] overflow-y-auto rounded-lg border">

          <table className="w-full">
            <thead className="sticky top-0 bg-[#F9FAFB] text-[#111827]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#111827]">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-semibold text-[#111827]">
                  Time In
                </th>

                <th className="px-4 py-3 text-left font-semibold text-[#111827]">
                  Time Out
                </th>

                <th className="px-4 py-3 text-left font-semibold text-[#111827]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>

              {filteredHistory.map((attendance) => (

                <tr
                  key={attendance.id}
                  className="border-t"
                >

                  <td className="px-4 py-3 text-[#374151]">
                    {attendance.date}
                  </td>

                  <td className="px-4 py-3 text-[#374151]">
                    {attendance.timeIn}
                  </td>

                  <td className="px-4 py-3 text-[#374151]">
                    {attendance.timeOut}
                  </td>

                  <td className="px-4 py-3 text-[#374151]">
                    {attendance.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </Modal>
  );
}