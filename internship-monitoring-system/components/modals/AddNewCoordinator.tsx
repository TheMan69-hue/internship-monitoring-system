'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import MultiSelectDropdown from '@/components/buttons/MultiSelectDropdown';
import { Coordinator } from '@/lib/types';
import { createCoordinator, updateCoordinator, resetCoordinatorPassword } from '@/lib/actions/coordinators';

interface AddNewCoordinatorProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: (Coordinator & { sections?: string[] }) | null;
  sectionOptions?: { id: string; name: string }[];
}

export default function AddNewCoordinator({
  show,
  onClose,
  onSuccess,
  editData,
  sectionOptions = [],
}: AddNewCoordinatorProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Temp password display state (FR-3.1.13: one-time display after creation/reset)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  // Initialize form when editData changes
  useEffect(() => {
    const initForm = () => {
      if (editData) {
        setName(editData.name ?? '');
        setEmail(editData.email ?? '');
        setContact(editData.contact_num ?? '');
        setSelectedSections(editData.sections ?? []);
      } else {
        setName('');
        setEmail('');
        setContact('');
        setSelectedSections([]);
      }
      setError('');
      setCreatedPassword(null);
      setCopied(false);
      setResetMode(false);
    };
    setTimeout(initForm, 0);
  }, [editData]);

  if (!show) return null;

  // ── Success screen: show the generated temp password once ──
  if (createdPassword) {
    return (
      <Modal title={resetMode ? 'Password Reset' : 'Coordinator Created'} onClose={onClose}>
        <div className="flex flex-col text-black gap-5 items-center py-4">
          <p className="text-sm text-gray-600 text-center">
            {resetMode
              ? 'The coordinator password has been reset. The new temporary password below is displayed <strong>once</strong> — copy or print it for out-of-band delivery. The coordinator will be forced to change it on next login.'
              : 'The coordinator account has been created. The temporary password below is displayed <strong>once</strong> — copy or print it for out-of-band delivery.'
            }
          </p>

          <div className="w-full max-w-xs bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-center">
            <label className="block text-xs text-gray-500 mb-1">
              Temporary Password
            </label>
            <span className="text-lg font-mono font-bold tracking-widest text-gray-800 select-all">
              {createdPassword}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(createdPassword);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="primary"
              size="sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="secondary"
              size="sm"
            >
              Print
            </Button>
          </div>

          <Button
            onClick={() => {
              setCreatedPassword(null);
              onClose();
              onSuccess();
            }}
            variant="secondary"
            size="sm"
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Reset Password handler ──
  const handleResetPassword = async () => {
    if (!editData?.id) return;
    setResetLoading(true);
    setError('');

    try {
      const result = await resetCoordinatorPassword(editData.id);

      if (result.success && result.tempPassword) {
        setResetMode(true);
        setCreatedPassword(result.tempPassword);
      } else {
        setError(result.message ?? 'Failed to reset password.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Form screen ──
  const handleSubmit = async () => {
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

    try {
      if (editData) {
        const result = await updateCoordinator(editData.id, {
          name: name.trim(),
          contact_num: contact.trim(),
          section_ids: selectedSections,
        });

        if (result.success) {
          onSuccess();
          onClose();
        } else {
          setError(result.message ?? 'Failed to update coordinator.');
        }
      } else {
        // FR-3.1.11: Admin fills name, email, contact, sections
        // FR-3.1.12: Password is auto-generated server-side (no admin input)
        const result = await createCoordinator({
          name: name.trim(),
          email: email.trim(),
          contact_num: contact.trim(),
          section_ids: selectedSections,
        });

        if (result.success && result.tempPassword) {
          // FR-3.1.13: Show temp password once for out-of-band delivery
          setCreatedPassword(result.tempPassword);
        } else {
          setError(result.message ?? 'Failed to create coordinator.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    }
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

        <MultiSelectDropdown
          label="Assigned Sections"
          options={sectionOptions}
          selected={selectedSections}
          onChange={setSelectedSections}
          placeholder="Select sections"
        />

        {editData && (
          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-xs text-gray-500 mb-2 text-center">
              The coordinator&apos;s password is managed by the system.
              Use the button below to generate a new temporary password if needed.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleResetPassword}
                type="button"
                variant="danger"
                size="sm"
                disabled={resetLoading}
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        )}

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
