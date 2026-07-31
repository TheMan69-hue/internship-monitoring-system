"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import FormInput from "@/components/forms/FormInput";

type EditUserDetailsModalProps = {
  username: string;
  email: string;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: {
    username: string;
    email: string;
    password?: string;
  }) => Promise<void>;
  errorMessage?: string;
};

export default function EditUserDetailsModal({
  username,
  email,
  loading = false,
  onClose,
  onSave,
  errorMessage,
}: EditUserDetailsModalProps) {
  const [formUsername, setFormUsername] = useState(username);
  const [formEmail, setFormEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setFormUsername(username);
    setFormEmail(email);
    setPassword("");
    setConfirmPassword("");
    setLocalError("");
  }, [username, email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
    }

    setLocalError("");

    await onSave({
      username: formUsername.trim(),
      email: formEmail.trim(),
      password: password.trim() || undefined,
    });
  };

  return (
    <Modal title="Edit User Details" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <FormInput
            label="Username"
            value={formUsername}
            required
            onChange={(event) => setFormUsername(event.target.value)}
          />

          <FormInput
            label="Email"
            type="email"
            value={formEmail}
            required
            onChange={(event) => setFormEmail(event.target.value)}
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            placeholder="Leave blank to keep the current password"
            onChange={(event) => setPassword(event.target.value)}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            placeholder="Repeat the new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {(localError || errorMessage) && (
          <p className="text-sm text-[#B91C1C]">{localError || errorMessage}</p>
        )}

        <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] pt-4">
          <button
            type="button"
            onClick={onClose}
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