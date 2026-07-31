"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import FormInput from "@/components/forms/FormInput";
import type { Student } from "@/lib/types";

type EditInternDetailsModalProps = {
  student: Student;
  sections: string[];
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onCancel: () => void;
  onSave: (data: {
    fullName: string;
    email: string;
    program: string;
    section: string;
    password?: string;
  }) => Promise<void>;
};

export default function EditInternDetailsModal({
  student,
  sections,
  loading = false,
  errorMessage,
  onClose,
  onCancel,
  onSave,
}: EditInternDetailsModalProps) {
  const [formFullName, setFormFullName] = useState(student.name);
  const [formEmail, setFormEmail] = useState(student.email);
  const [formProgram, setFormProgram] = useState(student.program);
  const [formSection, setFormSection] = useState(student.section);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setFormFullName(student.name);
    setFormEmail(student.email);
    setFormProgram(student.program);
    setFormSection(student.section);
    setPassword("");
    setConfirmPassword("");
    setLocalError("");
  }, [student]);

  const sectionOptions = Array.from(new Set([student.section, ...sections].filter(Boolean)));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextPassword = password.trim();
    const nextConfirmPassword = confirmPassword.trim();

    if (nextPassword || nextConfirmPassword) {
      if (nextPassword.length < 8) {
        setLocalError("Password must be at least 8 characters.");
        return;
      }

      if (nextPassword !== nextConfirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
    }

    setLocalError("");

    await onSave({
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      program: formProgram.trim(),
      section: formSection.trim(),
      password: nextPassword || undefined,
    });
  };

  return (
    <Modal title="Edit Intern Details" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <FormInput
            label="Full Name"
            value={formFullName}
            required
            onChange={(event) => setFormFullName(event.target.value)}
          />

          <FormInput
            label="Email"
            type="email"
            value={formEmail}
            required
            onChange={(event) => setFormEmail(event.target.value)}
          />

          <FormInput
            label="Program"
            value={formProgram}
            required
            onChange={(event) => setFormProgram(event.target.value)}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              Section
            </label>
            <select
              value={formSection}
              required
              onChange={(event) => setFormSection(event.target.value)}
              className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB] disabled:bg-[#F3F4F6]"
            >
              {sectionOptions.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Change Password"
            type="password"
            value={password}
            placeholder="Leave blank to keep the current password"
            onChange={(event) => setPassword(event.target.value)}
          />

          <FormInput
            label="Confirm Change Password"
            type="password"
            value={confirmPassword}
            placeholder="Repeat the new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {(localError || errorMessage) && (
          <p className="text-sm text-[#B91C1C]">{localError || errorMessage}</p>
        )}

        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}