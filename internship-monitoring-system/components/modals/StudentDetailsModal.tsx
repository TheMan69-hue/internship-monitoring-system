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
            {student.hte?.companyName ?? "No HTE"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            HTE Status
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte?.status ?? "No HTE"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            HTE Address
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte?.address ?? "No Address"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            HTE Contact Person
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte?.contactPerson ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            HTE Contact Number
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte?.contactNumber ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            HTE Email
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte?.email ?? "N/A"}
          </p>
        </div>

      </div>

      <div className="flex justify-end border-t bg-[#F9FAFB] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}