"use client";

import { useState } from "react";
import type { HTE } from "@/lib/types";
import Modal from "./Modal";
import HTEForm from "@/components/forms/HTEForm";
import { updateHTEAction } from "@/lib/actions/hte";

type HTEFormModalProps = {
  hte: HTE;
  hteId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function HTEFormModal({
  hte,
  hteId,
  onClose,
  onSuccess,
  onError,
}: HTEFormModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async (updatedHTE: HTE) => {
    setLoading(true);
    const result = await updateHTEAction(hteId, {
      company_name: updatedHTE.company,
      address: updatedHTE.address,
      contact_person: updatedHTE.contactPerson ?? "",
      contact_number: updatedHTE.phone ?? "",
      email: updatedHTE.email ?? "",
    });
    setLoading(false);

    if (!result.success) {
      onError(result.message ?? "Failed to update HTE.");
      return;
    }

    onSuccess();
  };

  return (
    <Modal title="Edit HTE" onClose={onClose}>
      <div className="p-6">
        <HTEForm
          initialData={hte}
          onSave={handleSave}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </Modal>
  );
}
