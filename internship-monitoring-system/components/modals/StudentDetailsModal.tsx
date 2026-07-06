"use client";

import type { Student } from "@/lib/types";
import Modal from "./Modal";

type StudentDetailsModalProps = {
  student: Student;
  onClose: () => void;
};

export default function StudentDetailsModal({
  student,
  onClose,
}: StudentDetailsModalProps) {
  return (
    <Modal
      title="Student Details"
      onClose={onClose}
    >
      {/* Content */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Student Number
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.studentNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Full Name
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Program
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.program}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Section
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.section}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Email
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.email}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Contact Number
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.contactNumber}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Assigned HTE
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Internship Status
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.status}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Work Schedule
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.workSchedule}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Working Hours
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.workingHours}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            OJT Start Date
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.startDate}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            OJT End Date
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.endDate}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Assigned Coordinator
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.coordinator}
          </p>
        </div>

      </div>

      {/* Footer */}
    <div className="flex justify-end border-t bg-[#F9FAFB] px-6 py-4">
        <button
            className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
            Edit
        </button>
    </div>

    </Modal>
  );
}