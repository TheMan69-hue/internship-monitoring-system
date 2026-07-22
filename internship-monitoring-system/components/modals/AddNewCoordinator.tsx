'use client';

import { useState } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import MultiSelectDropdown from '@/components/buttons/MultiSelectDropdown';
import { Coordinator } from '@/lib/types';

interface AddNewCoordinatorProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Coordinator, 'id' | 'password'> & { id?: number; sections?: number[]; password?: string }) => void;
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [changePassword, setChangePassword] = useState(false);
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
    // Password validation
    if (!editData && !password) {
      setError('Password is required.');
      return;
    }
    if (password) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setError('');
    const submitData: Omit<Coordinator, 'id' | 'password'> & { id?: number; sections?: number[]; password?: string } = {
      ...(editData && { id: editData.id }),
      name: name.trim(),
      email: email.trim(),
      contact_num: contact.trim(),
      role: 'coordinator',
      is_active: editData?.is_active ?? false,
      sections: selectedSections,
    };
    if (password) {
      submitData.password = password;
    }
    onSubmit(submitData);
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
            className="w-full rounded-[10px] border border-[#D1D5DB] px-2 py-1 text-[#374151] outline-none transition focus:border-[#2563EB]"
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
            className="w-full rounded-[10px] border border-[#D1D5DB] px-2 py-1 text-[#374151] outline-none transition focus:border-[#2563EB]"
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
            className="w-full rounded-[10px] border border-[#D1D5DB] px-2 py-1 text-[#374151] outline-none transition focus:border-[#2563EB]"
          />
        </div>

        <div className='flex w-full gap-10'>
          {editData && !changePassword ? (
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-[#374151]">
                Password
              </label>
              <div className="flex items-center gap-3 w-full rounded-[10px] border border-[#D1D5DB] px-2 py-1 text-[#374151] bg-gray-50">
                <span className="text-sm tracking-wider">••••••••</span>
                <span className="text-xs text-gray-400">(set)</span>
                <button
                  type="button"
                  onClick={() => setChangePassword(true)}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    if (confirmPassword) {
                      setConfirmError(
                        e.target.value !== confirmPassword ? "Passwords do not match" : ''
                      );
                    }
                  }}
                  placeholder={editData ? 'Enter new password (min 8 characters)' : 'Enter password (min 8 characters)'}
                  className="w-full rounded-[10px] border border-[#D1D5DB] px-2 py-1 text-[#374151] outline-none transition focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    setError('');
                    if (val && val !== password) {
                      setConfirmError("Passwords do not match");
                    } else {
                      setConfirmError('');
                    }
                  }}
                  placeholder="Confirm password"
                  className={`w-full rounded-[10px] border px-2 py-1 text-[#374151] outline-none transition ${
                    confirmError ? 'border-red-400 focus:border-red-500' : 'border-[#D1D5DB] focus:border-[#2563EB]'
                  }`}
                />
                {confirmError && (
                  <p className="text-red-500 text-xs mt-1">{confirmError}</p>
                )}
              </div>
            </>
          )}
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
