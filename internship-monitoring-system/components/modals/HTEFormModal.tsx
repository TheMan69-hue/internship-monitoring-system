"use client";

import type { HTE } from "@/lib/types";
import Modal from "./Modal";
import HTEForm from "@/components/forms/HTEForm";

type HTEFormModalProps = {
  hte: HTE;
  onClose: () => void;
  onSave: (updatedHTE: HTE) => void;
};

export default function HTEFormModal({
  hte,
  onClose,
  onSave,
}: HTEFormModalProps) {
  return (
    <Modal
      title="Edit HTE"
      onClose={onClose}
    >
      <div className="p-6">
        <HTEForm
          initialData={hte}
          onSave={onSave}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}