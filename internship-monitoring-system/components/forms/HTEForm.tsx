"use client";

import { useState } from "react";

import type { HTE } from "@/lib/types";

import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormSelect from "./FormSelect";

type HTEFormProps = {
  initialData: HTE;
  onSave: (hte: HTE) => void;
  onCancel: () => void;
};

export default function HTEForm({
  initialData,
  onSave,
  onCancel,
}: HTEFormProps) {
  const [form, setForm] = useState(initialData);
  const [startTime, setStartTime] = useState(
    initialData.workingHours?.split(" - ")[0] ?? "08:00"
  );

  const [endTime, setEndTime] = useState(
    initialData.workingHours?.split(" - ")[1] ?? "17:00"
  );
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-6">

        <FormInput
          label="Company Name"
          name="company"
          value={form.company}
          onChange={handleInputChange}
        />

        <FormInput
          label="Contact Person"
          name="contactPerson"
          value={form.contactPerson ?? ""}
          onChange={handleInputChange}
        />

        <FormInput
          label="Email"
          type="email"
          name="email"
          value={form.email ?? ""}
          onChange={handleInputChange}
        />

        <FormInput
          label="Contact Number"
          name="phone"
          value={form.phone ?? ""}
          onChange={handleInputChange}
        />

      </div>

      <FormTextarea
        label="Company Address"
        name="address"
        rows={4}
        value={form.address}
        onChange={handleTextareaChange}
      />

      <div className="grid grid-cols-2 gap-6">

        <FormSelect
          label="Work Schedule"
          name="workSchedule"
          value={form.workSchedule ?? ""}
          options={[
            "Monday - Friday",
            "Monday - Saturday",
            "Flexible",
          ]}
          onChange={handleSelectChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);

              setForm({
                ...form,
                workingHours: `${e.target.value} - ${endTime}`,
              });
            }}
          />

          <FormInput
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);

              setForm({
                ...form,
                workingHours: `${startTime} - ${e.target.value}`,
              });
            }}
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 border-t pt-6">

        <button
          onClick={onCancel}
          className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              const response = await fetch("/api/hte", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
              });

              if (!response.ok) {
                throw new Error("Failed to update HTE");
              }

              onSave(form);

              window.location.reload();
            } catch (error) {
              console.error(error);
              alert("Failed to update HTE.");
            }
          }}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white hover:bg-[#1D4ED8]"
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}