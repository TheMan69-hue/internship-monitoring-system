"use client";

import { useState } from "react";
import type { HTE } from "@/lib/types";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import { deleteHTEAction } from "@/lib/actions/hte";

type HTEDetailsModalProps = {
  hte: HTE;
  hteId: string;
  onClose: () => void;
  onEdit: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function HTEDetailsModal({
  hte,
  hteId,
  onClose,
  onEdit,
  onSuccess,
  onError,
}: HTEDetailsModalProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteHTEAction(hteId);
    setDeleting(false);
    setShowDeleteConfirmation(false);

    if (!result.success) {
      onError(result.message ?? "Failed to delete HTE.");
      return;
    }

    onSuccess();
  };

  return (
    <Modal title="HTE Details" onClose={onClose}>
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
            {hte.contactPerson ?? "N/A"}
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
            {hte.phone ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Email
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.email ?? "N/A"}
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
            {hte.workSchedule ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Working Hours
          </p>
          <p className="mt-1 text-base font-medium text-[#111827]">
            {hte.workingHours ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">
        <button
          onClick={onEdit}
          className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Edit
        </button>

        <button
          onClick={() => setShowDeleteConfirmation(true)}
          className="rounded-[10px] bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C]"
        >
          Delete
        </button>
      </div>

      <ConfirmationModal
        open={showDeleteConfirmation}
        title="Delete HTE"
        message={`Are you sure you want to delete "${hte.company}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#DC2626"
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />

      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[20px]">
          <p className="text-sm text-[#374151]">Deleting...</p>
        </div>
      )}
    </Modal>
  );
}
