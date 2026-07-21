'use client';

import { useState } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import Dropdown from '@/components/buttons/dropdown';

interface AddNewSchoolYearProps {
  show: boolean;
  onClose: () => void;
}

export default function AddNewSchoolYear({
  show,
  onClose,
}: AddNewSchoolYearProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  
  if (!show) return null;

  return (
    <Modal
        title="New Record"
        onClose={onClose} // close modal when X or overlay clicked
    >
        <div className="flex flex-col text-black gap-5">
          <p>School Year Timeline:</p>

          <div className="flex items-center gap-10">
              <p>Start Date:</p>
              <input
              className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              />
          </div>

          <div className="flex items-center gap-11">
              <p>End Date:</p>
              <input
              className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              />
          </div>

          <Dropdown
              label="Choose Semester"
              options={["1st Semester", "2nd Semester", "Summer"]}
              onSelect={setSelectedSemester}
          />

          <p>Semester Timeline:</p>

          <div className="flex items-center gap-10">
              <p>Start Date:</p>
              <input
              className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              />
          </div>

          <div className="flex items-center gap-11">
              <p>End Date:</p>
              <input
              className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              />
          </div>

          <div className="flex justify-center gap-5 mt-5">
              <Button
              onClick={() => {
                  // TODO: handle form submission here
                  console.log("Adding new school year with semester:", selectedSemester);
                  onClose();
              }}
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
