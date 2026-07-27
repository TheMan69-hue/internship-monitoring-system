"use client";

import { useState } from "react";
import Modal from "./Modal";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";
import FormSelect from "@/components/forms/FormSelect";

type RegisterHTEModalProps = {
  onClose: () => void;
};

export default function RegisterHTEModal({
  onClose,
}: RegisterHTEModalProps) {
  const [company, setCompany] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [workSchedule, setWorkSchedule] = useState("Monday - Friday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [address, setAddress] = useState("");

  async function handleSave() {
    if (!company.trim()) {
      alert("Company Name is required.");
      return;
    }

    try {
      const response = await fetch("/api/hte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          address,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          workSchedule: workSchedule || null,
          workingHours: `${startTime} - ${endTime}`,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create HTE");
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to register HTE.");
    }
  }

  return (
    <Modal
      title="Register New HTE"
      onClose={onClose}
    >
      {/* Form */}
      <div className="grid grid-cols-2 gap-6 p-6">
        <FormInput
          label="Company Name"
          value={company}
          required
          onChange={(e) => setCompany(e.target.value)}
        />

        <FormInput
          label="Contact Person"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />

        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          label="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <FormSelect
          label="Work Schedule"
          value={workSchedule}
          required
          options={[
            "Monday - Friday",
            "Monday - Saturday",
            "Flexible",
          ]}
          onChange={(e) => setWorkSchedule(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <FormInput
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <FormTextarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t bg-[#F9FAFB] px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}