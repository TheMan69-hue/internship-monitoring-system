"use client";

import { useState } from "react";
import Modal from "./Modal";

type ReasonModalProps = {
  title: string;
  placeholder?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function ReasonModal({
  title,
  placeholder = "Enter reason...",
  confirmText = "Confirm",
  onClose,
  onConfirm,
}: ReasonModalProps) {

  const [reason, setReason] = useState("");

  return (
    <Modal
      title={title}
      onClose={onClose}
    >
      <div className="p-6">

        <label className="mb-2 block text-sm font-medium text-[#374151]">
          Reason
        </label>

        <textarea
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          rows={5}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#D1D5DB] p-3 text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB]"
        />

      </div>

      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">

        <button
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>

        <button
          onClick={() =>
            onConfirm(reason)
          }
          disabled={!reason.trim()}
          className="rounded-lg bg-[#DC2626] px-5 py-2 text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirmText}
        </button>

      </div>

    </Modal>
  );
}