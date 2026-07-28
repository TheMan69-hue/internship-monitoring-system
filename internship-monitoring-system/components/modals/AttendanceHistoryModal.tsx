"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Modal from "./Modal";
import ReviewAttendanceModal from "./ReviewAttendanceModal";

import {
  approveAttendanceAction,
  rejectAttendanceAction,
} from "@/lib/actions/attendance";

import type { AttendanceLog } from "@/lib/types";

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

  const [reviewAttendance, setReviewAttendance] =
    useState<AttendanceLog | null>(null);

  const router = useRouter();

  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;

    return history.filter(
      (attendance) => attendance.rawDate === selectedDate
    );
  }, [history, selectedDate]);

  return (
    <>
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
            Showing {filteredHistory.length} of {history.length} attendance
            record(s)
          </p>

          <div className="max-h-[400px] overflow-y-auto rounded-lg border">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#F9FAFB] text-[#111827]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Time In
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Time Out
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
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

                    <td className="px-4 py-3">
                      {attendance.flaggedForReview ? (
                        <button
                          onClick={() =>
                            setReviewAttendance(attendance)
                          }
                          className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 transition hover:bg-yellow-200"
                        >
                          To Review
                        </button>
                      ) : (
                        <span
                          className={`font-medium ${
                            attendance.status === "Present"
                              ? "text-green-600"
                              : attendance.status === "Late"
                              ? "text-orange-500"
                              : attendance.status === "Incomplete"
                              ? "text-red-600"
                              : "text-[#374151]"
                          }`}
                        >
                          {attendance.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {reviewAttendance && (
        <ReviewAttendanceModal
          attendance={reviewAttendance}
          onClose={() => setReviewAttendance(null)}
          onApprove={async () => {
            const result = await approveAttendanceAction(
              reviewAttendance.id
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
              reviewAttendance.id
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
    </>
  );
}