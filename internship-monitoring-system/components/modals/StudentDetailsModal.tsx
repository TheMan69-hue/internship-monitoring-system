"use client";

import { useState } from "react";

import type { Student } from "@/lib/types";
import Modal from "./Modal";
import EditWorkScheduleModal from "./EditWorkScheduleModal";
import { saveStudentWorkSchedule } from "@/lib/actions/workSchedule";

type StudentDetailsModalProps = {
  student: Student;
  onClose: () => void;
};

export default function StudentDetailsModal({
  student,
  onClose,
}: StudentDetailsModalProps) {

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>

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

          {/* Internship Schedule */}

          <div className="col-span-2 mt-4 border-t pt-6">
            <h3 className="mb-4 text-lg font-semibold text-[#111827]">
              Internship Schedule
            </h3>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Expected Time In
            </p>

            <p className="mt-1 text-base font-medium text-[#111827]">
              {student.schedule?.expectedTimeIn ?? "Not Configured"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Expected Time Out
            </p>

            <p className="mt-1 text-base font-medium text-[#111827]">
              {student.schedule?.expectedTimeOut ?? "Not Configured"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Required Hours
            </p>

            <p className="mt-1 text-base font-medium text-[#111827]">
              {student.schedule
                ? `${student.schedule.requiredHours} Hours`
                : "Not Configured"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Grace Period
            </p>

            <p className="mt-1 text-base font-medium text-[#111827]">
              {student.schedule
                ? `${student.schedule.graceMinutes} Minutes`
                : "Not Configured"}
            </p>
          </div>

        </div>

        <div className="flex justify-between border-t bg-[#F9FAFB] px-6 py-4">

          <button
            onClick={() => setShowScheduleModal(true)}
            className="rounded-[10px] border border-[#2563EB] px-5 py-2 text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Edit Schedule
          </button>

          <button
            onClick={onClose}
            className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
          >
            Close
          </button>

        </div>

      </Modal>

      {showScheduleModal && (
        <EditWorkScheduleModal
          studentId={student.id}
          studentName={student.name}
          initialTimeIn={student.schedule?.expectedTimeIn ?? null}
          initialTimeOut={student.schedule?.expectedTimeOut ?? null}
          initialHours={student.schedule?.requiredHours ?? 8}
          onClose={() => setShowScheduleModal(false)}
          onSave={async (
            timeIn,
            timeOut,
            requiredHours
          ) => {

            await saveStudentWorkSchedule(
              student.id,
              timeIn,
              timeOut,
              requiredHours
            );

            setShowScheduleModal(false);

          }}
        />
      )}

    </>
  );
}