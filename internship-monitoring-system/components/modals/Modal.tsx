"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-2xl rounded-[20px] bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-2xl font-semibold text-[#111827]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-[#F3F4F6]"
          >
            <X
              size={22}
              className="text-[#374151]"
            />
          </button>
        </div>
        <div className="px-10 py-6">
        {children}
        </div>
      </div>
    </div>
  );
}