"use client";

import Modal from "./Modal";
import DetailField from "@/components/ui/DetailField";
import type { Student } from "@/lib/types";

type InternDetailsModalProps = {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
};

export default function InternDetailsModal({
  student,
  onClose,
  onEdit,
}: InternDetailsModalProps) {
  return (
    <Modal title="Intern Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <DetailField label="Full Name" value={student.name} />
          <DetailField label="Student Number" value={student.studentNumber} />
          <DetailField label="Email" value={student.email} />
          <DetailField label="Program" value={student.program} />
          <DetailField label="Section" value={student.section} />
          <DetailField label="Contact Number" value={student.contactNumber} />
          {student.hte && <DetailField label="HTE Company" value={student.hte.companyName} />}
          {student.schedule && (
            <>
              <DetailField label="Expected Time In" value={student.schedule.expectedTimeIn} />
              <DetailField label="Expected Time Out" value={student.schedule.expectedTimeOut} />
              <DetailField label="Required Hours" value={String(student.schedule.requiredHours)} />
            </>
          )}
        </div>

        <div className="flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
}