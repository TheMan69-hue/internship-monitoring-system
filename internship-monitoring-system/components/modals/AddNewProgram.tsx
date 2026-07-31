'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import { createProgram, updateProgram } from '@/lib/actions/programs';

type AdminProgram = {
  id: string;
  name: string;
  required_hours: number;
  Total_Interns?: number;
  Total_Coordinator?: number;
};

interface AddNewProgramProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: AdminProgram | null;
}

export default function AddNewProgram({
  show,
  onClose,
  onSuccess,
  editData,
}: AddNewProgramProps) {
  const [name, setName] = useState("");
  const [requiredHours, setRequiredHours] = useState("");
  const [error, setError] = useState("");

  // Initialize form when editData changes
  useEffect(() => {
    const initForm = () => {
      if (editData) {
        setName(editData.name ?? "");
        setRequiredHours(editData.required_hours?.toString() ?? "");
      } else {
        setName("");
        setRequiredHours("");
      }
      setError("");
    };
    setTimeout(initForm, 0);
  }, [editData]);

  if (!show) return null;

  const handleSubmit = async () => {
    // Validate
    if (!name.trim()) {
      setError("Program name is required.");
      return;
    }
    if (!requiredHours.trim()) {
      setError("Required hours is required.");
      return;
    }
    const hoursNum = parseInt(requiredHours, 10);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError("Required hours must be a positive number.");
      return;
    }

    setError("");

    try {
      let result;
      if (editData) {
        result = await updateProgram(editData.id, {
          program_name: name.trim(),
          required_hours: hoursNum,
        });
      } else {
        result = await createProgram({
          program_name: name.trim(),
          required_hours: hoursNum,
        });
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message ?? "Failed to save program.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <Modal
      title={editData ? "Edit Program" : "New Program"}
      onClose={onClose}
    >
      <div className="flex flex-col text-black gap-5">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">Program Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Bachelor of Science in Computer Science"
            className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">Required Hours</label>
          <input
            type="number"
            value={requiredHours}
            onChange={(e) => { setRequiredHours(e.target.value); setError(""); }}
            placeholder="e.g. 486"
            min={1}
            className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <div className="flex justify-center gap-5 mt-5">
          <Button onClick={handleSubmit} type="submit" variant="primary" size="sm">
            {editData ? "Save" : "Add"}
          </Button>
          <Button onClick={onClose} type="button" variant="secondary" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
