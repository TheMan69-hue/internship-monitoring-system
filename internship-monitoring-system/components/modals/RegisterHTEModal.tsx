"use client";
import Modal from "./Modal";
import FormInput from "@/components/forms/FormInput";
import FormTextarea from "@/components/forms/FormTextarea";

type RegisterHTEModalProps = {
  onClose: () => void;
};

export default function RegisterHTEModal({
  onClose,
}: RegisterHTEModalProps) {
  return (
    <Modal
      title="Register New HTE"
      onClose={onClose}
    >
      {/* Form */}
      <div className="grid grid-cols-2 gap-6 p-6">

        <FormInput
          label="Company Name"
        />

        <FormInput
          label="Contact Person"
        />

        <FormInput
          label="Email"
          type="email"
        />

        <FormInput
          label="Contact Number"
        />

        <FormInput
          label="Work Schedule"
        />

        <FormInput
          label="Working Hours"
        />

        <div className="col-span-2">
          <FormTextarea
            label="Address"
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
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}