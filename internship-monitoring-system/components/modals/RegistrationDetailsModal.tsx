"use client";

import { registrationStudents } from "@/lib/data/registration";
import Modal from "./Modal";

type RegistrationDetailsModalProps = {
  student: (typeof registrationStudents)[0];
  onClose: () => void;

  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;

  showDelete?: boolean;
};

export default function RegistrationDetailsModal({
  student,
  onClose,
  onApprove,
  onReject,
  onDelete,
  showDelete = false,
}: RegistrationDetailsModalProps) {
  return (
    <Modal
      title="Student Registration Details"
      onClose={onClose}
    >
      {/* Body */}
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
            Student Name
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

        <div className="col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Preferred HTE
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {student.hte}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">

        <button
          onClick={onApprove}
          className="rounded-[10px] bg-[#16A34A] px-5 py-2 text-white transition hover:bg-[#15803D]"
        >
          Approve
        </button>

        {showDelete ? (
          <button
            onClick={onDelete}
            className="rounded-[10px] bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C]"
          >
            Delete
          </button>
        ) : (
          <button
            onClick={onReject}
            className="rounded-[10px] bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C]"
          >
            Reject
          </button>
        )}

      </div>
    </Modal>
  );
}