"use client";

import { useState } from "react";
import Modal from "./Modal";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import { createHTEAction } from "@/lib/actions/hte";

type RegisterHTEModalProps = {
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function RegisterHTEModal({
  onClose,
  onSuccess,
  onError,
}: RegisterHTEModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    contact_number: "",
    address: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await createHTEAction(form);
    setLoading(false);

    if (!result.success) {
      onError(result.message ?? "Failed to create HTE.");
      return;
    }

    onSuccess();
  };

  return (
    <Modal title="Register New HTE" onClose={onClose}>
      <div className="grid grid-cols-2 gap-6 p-6">
        <FormInput
          label="Company Name"
          name="company_name"
          value={form.company_name}
          onChange={handleInputChange}
          required
        />

        <FormInput
          label="Contact Person"
          name="contact_person"
          value={form.contact_person}
          onChange={handleInputChange}
        />

        <FormInput
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
        />

        <FormInput
          label="Contact Number"
          name="contact_number"
          value={form.contact_number}
          onChange={handleInputChange}
        />

        <div className="col-span-2">
          <FormTextarea
            label="Address"
            name="address"
            rows={3}
            value={form.address}
            onChange={handleTextareaChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading || !form.company_name}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}
