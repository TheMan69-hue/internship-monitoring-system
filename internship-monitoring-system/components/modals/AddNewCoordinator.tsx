'use client';

import { useState } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import MultiSelectDropdown from '@/components/buttons/MultiSelectDropdown';
import { Coordinator } from '@/lib/types';

interface AddNewCoordinatorProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Coordinator, 'id'> & { id?: number; sections?: number[] }) => void;
  editData?: (Coordinator & { sections?: number[] }) | null;
  sectionOptions?: { id: number; name: string }[];
}

export default function AddNewCoordinator({
  show,
  onClose,
  onSubmit,
  editData,
  sectionOptions = [],
}: AddNewCoordinatorProps) {
  const [name, setName] = useState(editData?.name || '');
  const [email, setEmail] = useState(editData?.email || '');
  const [contact, setContact] = useState(editData?.contact_num || '');
  const [selectedSections, setSelectedSections] = useState<number[]>(
    editData?.sections || []
  );
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!contact.trim()) {
      setError('Contact number is required.');
      return;
    }

    setError('');
    onSubmit({
      ...(editData && { id: editData.id }),
      name: name.trim(),
      email: email.trim(),
      contact_num: contact.trim(),
      role: 'coordinator',
      is_active: editData?.is_active ?? false,
      sections: selectedSections,
    });
    onClose();
  };

  return (
    <Modal
      title={editData ? 'Edit Coordinator' : 'New Coordinator'}
      onClose={onClose}
    >
      <div className="flex flex-col text-black gap-5">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Juan Dela Cruz"
            className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="e.g. juandelacruz@example.com"
            className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#374151]">
            Contact
          </label>
          <input
            type="tel"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              setError('');
            }}
            placeholder="e.g. 09991234567"
            className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <MultiSelectDropdown
          label="Assigned Sections"
          options={sectionOptions}
          selected={selectedSections}
          onChange={setSelectedSections}
          placeholder="Select sections"
        />

        <div className="flex justify-center gap-5 mt-5">
          <Button onClick={handleSubmit} type="submit" variant="primary" size="sm">
            {editData ? 'Save' : 'Add'}
          </Button>
          <Button onClick={onClose} type="button" variant="secondary" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
