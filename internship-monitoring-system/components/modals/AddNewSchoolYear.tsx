'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';

interface SchoolYear {
  id: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
}

interface AddNewSchoolYearProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; start_date: string; end_date: string }) => void;
  existingNames?: string[];
  editData?: SchoolYear | null;
}

export default function AddNewSchoolYear({
  show,
  onClose,
  onSubmit,
  existingNames = [],
  editData = null,
}: AddNewSchoolYearProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    const initForm = () => {
      if (editData) {
        setStartDate(editData.startDate ?? "");
        setEndDate(editData.endDate ?? "");
      } else {
        setStartDate("");
        setEndDate("");
      }
      setError("");
    };
    setTimeout(initForm, 0);
  }, [editData]);

  if (!show) return null;

  const handleSubmit = () => {
    setError("");

    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (!endDate) {
      setError("End date is required.");
      return;
    }

    if (endDate <= startDate) {
      setError("End date must be after the start date.");
      return;
    }

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    if (endYear - startYear !== 1) {
      setError("There must be exactly a 1-year gap between the start and end years.");
      return;
    }

    const name = `${startYear}-${endYear}`;

    // Skip duplicate check when editing (we're updating the same record)
    if (!editData && existingNames.includes(name)) {
      setError(`School year "${name}" already exists.`);
      return;
    }

    onSubmit({ name, start_date: startDate, end_date: endDate });
    onClose();
  };

  return (
    <Modal title={editData ? "Edit Academic Year" : "New Academic Year"} onClose={onClose}>
      <div className="flex flex-col text-black gap-5">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <p>School Year Timeline:</p>

        <div className="flex items-center gap-10">
          <p>Start Date:</p>
          <input
            type="date"
            className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={(e) => {
              setError("");
              setStartDate(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center gap-11">
          <p>End Date:</p>
          <input
            type="date"
            className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              const selected = e.target.value;
              if (startDate && selected <= startDate) {
                setError("End date must be after the start date.");
                return;
              }
              // Check 1-year gap in real time
              if (startDate) {
                const startYear = new Date(startDate).getFullYear();
                const endYear = new Date(selected).getFullYear();
                if (endYear - startYear !== 1) {
                  setError("There must be exactly a 1-year gap between the start and end years.");
                  return;
                }
              }
              setError("");
              setEndDate(selected);
            }}
          />
        </div>

        <div className="flex justify-center gap-5 mt-5">
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="primary"
            size="sm"
          >
            Add
          </Button>
          <Button
            onClick={onClose}
            type="button"
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
