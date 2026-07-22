"use client";

import { useState } from "react";
import type { AttendanceGroup } from "@/lib/types";

import Modal from "./Modal";
import AttendanceHistoryModal from "./AttendanceHistoryModal";
import AttendanceLocationModal from "./AttendanceLocationModal";

type AttendanceDetailsModalProps = {
  attendance: AttendanceGroup;
  onClose: () => void;
};

export default function AttendanceDetailsModal({
  attendance,
  onClose,
}: AttendanceDetailsModalProps) {
  const latest = attendance.latestAttendance;

  const [showHistory, setShowHistory] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <>
      <Modal
        title="Attendance Details"
        onClose={onClose}
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Student Number
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.studentNumber}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Student Name
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.studentName}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Program
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.program}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Section
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.section}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Assigned HTE
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.hte}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Attendance Date
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.date}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Time In
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.timeIn}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Time Out
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.timeOut ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Time-In Location
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">
              {latest.location}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Status
            </p>
            <p className="mt-1 text-base font-medium capitalize text-[#111827]">
              {latest.status}
            </p>
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">

          <button
            onClick={() => setShowHistory(true)}
            className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            Attendance History
          </button>

          <button
            onClick={() => setShowLocationModal(true)}
            className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
          >
            View Time-In Location
          </button>

        </div>
      </Modal>

      {showHistory && (
        <AttendanceHistoryModal
          studentName={latest.studentName}
          history={attendance.attendanceHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showLocationModal && (
        <AttendanceLocationModal
          attendance={latest}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </>
  );
}