"use client";

import Modal from "./Modal";
import type { AttendanceLog } from "@/lib/types";

type ReviewAttendanceModalProps = {
  attendance: AttendanceLog;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
};

export default function ReviewAttendanceModal({
  attendance,
  onApprove,
  onReject,
  onClose,
}: ReviewAttendanceModalProps) {
  return (
    <Modal
      title="Review Attendance"
      onClose={onClose}
    >
      <div className="space-y-5 p-6">
        <div>
          <p className="text-xs font-semibold uppercase text-[#6B7280]">
            Student Number
          </p>
          <p className="mt-1 text-[#111827]">
            {attendance.studentNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-[#6B7280]">
            Student Name
          </p>
          <p className="mt-1 text-[#111827]">
            {attendance.studentName}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-[#6B7280]">
            Date
          </p>
          <p className="mt-1 text-[#111827]">
            {attendance.date}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              Time In
            </p>
            <p className="mt-1 text-[#111827]">
              {attendance.timeIn ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-[#6B7280]">
              Time Out
            </p>
            <p className="mt-1 text-[#111827]">
              {attendance.timeOut ?? "-"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-[#6B7280]">
            Time-In Location
          </p>
          <p className="mt-1 text-[#111827]">
            {attendance.location ?? "-"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">
        <button
          onClick={onReject}
          className="rounded-[10px] bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
        >
          Reject
        </button>

        <button
          onClick={onApprove}
          className="rounded-[10px] bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
        >
          Approve
        </button>
      </div>
    </Modal>
  );
}