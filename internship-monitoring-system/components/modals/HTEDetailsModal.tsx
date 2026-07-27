"use client";
import { formatWorkingHours } from "@/lib/utils/time";
import type { HTE } from "@/lib/types";
import Modal from "./Modal";

type HTEDetailsModalProps = {
  hte: HTE;
  onClose: () => void;
  onEdit: () => void;
};

export default function HTEDetailsModal({
  hte,
  onClose,
  onEdit,
}: HTEDetailsModalProps) {
  return (
    <Modal
      title="HTE Details"
      onClose={onClose}
    >
      {/* Content */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Company Name
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.company}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Contact Person
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.contactPerson}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Address
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.address}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Contact Number
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.phone}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Email
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.email}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Current Interns
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.currentInterns}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Work Schedule
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.workSchedule}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Working Hours
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {formatWorkingHours(hte.workingHours)}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">

        <button
          onClick={onEdit}
          className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Edit
        </button>

        <button
          onClick={async () => {
            try {
              const response = await fetch("/api/hte", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: hte.id,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to delete HTE");
              }

              onClose();

              window.location.reload();
            } catch (error) {
              console.error(error);
              alert("Failed to delete HTE.");
            }
          }}
          className="rounded-[10px] bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C]"
        >
          Delete
        </button>

      </div>

    </Modal>
  );
}