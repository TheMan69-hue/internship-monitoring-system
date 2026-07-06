"use client";

import type { AttendanceLog } from "@/lib/types";
import Modal from "./Modal";

type AttendanceDetailsModalProps = {
  attendance: AttendanceLog;
  onClose: () => void;
};

export default function AttendanceDetailsModal({
  attendance,
  onClose,
}: AttendanceDetailsModalProps) {
  return (
    <Modal
      title="Attendance Details"
      onClose={onClose}
    >
      {/* Content */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Student Number
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.studentNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Student Name
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.studentName}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Program
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.program}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Section
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.section}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Assigned HTE
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.hte}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Attendance Date
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.date}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Time In
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.timeIn}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Time Out
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.timeOut}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Location
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.location}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Remarks
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {attendance.remarks}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t bg-[#F9FAFB] px-6 py-4">

        <button
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          View on Map
        </button>

      </div>

    </Modal>
  );
}