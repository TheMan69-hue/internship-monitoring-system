"use client";

import { useState } from "react";
import Modal from "./Modal";

type AssignedSection = {
  id: string;
  label: string;
};

type UserDetailsModalProps = {
  username: string;
  email: string;
  employeeNumber?: string | null;
  department?: string | null;
  assignedSections?: AssignedSection[];
  onClose: () => void;
  onEdit: () => void;
};

export default function UserDetailsModal({
  username,
  email,
  employeeNumber,
  department,
  assignedSections = [],
  onClose,
  onEdit,
}: UserDetailsModalProps) {
  const [showAssignedSections, setShowAssignedSections] = useState(false);

  const isCoordinator =
    employeeNumber !== undefined || department !== undefined || assignedSections.length > 0;

  return (
    <Modal title="User Details" onClose={onClose}>
      <div className="space-y-6">
        <div className={`grid gap-6 ${isCoordinator ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Username
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">{username}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Email
            </p>
            <p className="mt-1 text-base font-medium text-[#111827]">{email}</p>
          </div>

          {isCoordinator && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Employee Number
                </p>
                <p className="mt-1 text-base font-medium text-[#111827]">
                  {employeeNumber ?? "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Department
                </p>
                <p className="mt-1 text-base font-medium text-[#111827]">
                  {department ?? "N/A"}
                </p>
              </div>

              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAssignedSections((value) => !value)}
                  className="w-full rounded-[10px] border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-left text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
                >
                  Assigned Sections
                </button>

                {showAssignedSections && (
                  <div className="mt-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    {assignedSections.length > 0 ? (
                      <ul className="space-y-2 text-sm text-[#374151]">
                        {assignedSections.map((section) => (
                          <li key={section.id} className="rounded-[8px] bg-white px-3 py-2 shadow-sm">
                            {section.label}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#6B7280]">No assigned sections.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t bg-[#F9FAFB] px-0 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-[10px] border border-[#D1D5DB] bg-white px-5 py-2 text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
}