"use client";

import { useState } from "react";
import Modal from "./Modal";

type EditWorkScheduleModalProps = {
  studentId: string;
  studentName: string;

  initialTimeIn?: string | null;
  initialTimeOut?: string | null;
  initialHours?: number | null;

  onSave: (
    timeIn: string,
    timeOut: string,
    requiredHours: number
  ) => Promise<void>;

  onClose: () => void;
};

export default function EditWorkScheduleModal({
  studentName,
  initialTimeIn,
  initialTimeOut,
  initialHours,
  onSave,
  onClose,
}: EditWorkScheduleModalProps) {

  const [timeIn, setTimeIn] = useState(
    initialTimeIn ?? "08:00"
  );

  const [timeOut, setTimeOut] = useState(
    initialTimeOut ?? "17:00"
  );

  const [requiredHours, setRequiredHours] = useState(
    initialHours ?? 8
  );

  const [saving, setSaving] = useState(false);

  async function handleSave() {

    setSaving(true);

    try {

      await onSave(
        timeIn,
        timeOut,
        requiredHours
      );

      onClose();

    } finally {

      setSaving(false);

    }

  }

  return (

    <Modal
      title="Edit Work Schedule"
      onClose={onClose}
    >

      <div className="space-y-6 p-6">

        <div>

          <p className="text-sm text-[#6B7280]">
            Student
          </p>

          <p className="text-lg font-semibold text-[#111827]">
            {studentName}
          </p>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-[#374151]">
            Expected Time In
          </label>

          <input
            type="time"
            value={timeIn}
            onChange={(e)=>setTimeIn(e.target.value)}
            className="w-full rounded-lg border border-[#D1D5DB] bg-white p-2 text-[#111827]"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Expected Time Out
          </label>

          <input
            type="time"
            value={timeOut}
            onChange={(e)=>setTimeOut(e.target.value)}
            className="w-full rounded-lg border border-[#D1D5DB] p-2"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Required Hours
          </label>

          <input
            type="number"
            min={1}
            max={24}
            value={requiredHours}
            onChange={(e)=>
              setRequiredHours(
                Number(e.target.value)
              )
            }
            className="w-full rounded-lg border border-[#D1D5DB] p-2"
          />

        </div>

      </div>

      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">

        <button
          onClick={onClose}
          className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>

        <button
          disabled={saving}
          onClick={handleSave}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          {saving ? "Saving..." : "Save"}
        </button>

      </div>

    </Modal>

  );

}