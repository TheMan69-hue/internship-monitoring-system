"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/search/SearchInput";
import HTETable from "@/components/table/HTETable";
import HTEFormModal from "@/components/modals/HTEFormModal";
import RegisterHTEModal from "@/components/modals/RegisterHTEModal";
import HTEDetailsModal from "@/components/modals/HTEDetailsModal";
import ActionModal from "@/components/modals/ActionModal";
import type { HTE } from "@/lib/types";

type HTEWithCount = {
  id: string;
  company_name: string;
  address: string | null;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  work_schedule: string | null;
  working_hours: string | null;
  status: string;
  gps_coordinates: string | null;
  currentInterns: number;
};

type HTEManagementClientProps = {
  initialHTes: HTEWithCount[];
};

export default function HTEManagementClient({
  initialHTes,
}: HTEManagementClientProps) {
  const router = useRouter();
  const [htes] = useState(initialHTes);
  const [search, setSearch] = useState("");
  const [selectedHTE, setSelectedHTE] = useState<HTEWithCount | null>(null);
  const [editingHTE, setEditingHTE] = useState<HTEWithCount | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"success" | "error">("success");
  const [actionTitle, setActionTitle] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const filteredHTes = htes.filter(
    (hte) =>
      hte.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (hte.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const showMessage = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setActionType(type);
    setActionTitle(title);
    setActionMessage(message);
    setShowActionModal(true);
  };

  const toHTE = (hte: HTEWithCount): HTE => ({
    id: hte.id,
    company: hte.company_name,
    address: hte.address ?? "",
    contactPerson: hte.contact_person ?? null,
    email: hte.email ?? null,
    phone: hte.contact_number ?? null,
    workSchedule: hte.work_schedule ?? null,
    workingHours: hte.working_hours ?? null,
    currentInterns: hte.currentInterns,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowRegisterModal(true)}
          className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
          + Add HTE
        </button>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search HTE..."
        />
      </div>

      <HTETable
        data={filteredHTes.map((hte) => toHTE(hte))}
        onRowClick={(hte) => {
          const matched = htes.find((h) => h.id === hte.id);
          if (matched) setSelectedHTE(matched);
        }}
      />

      {selectedHTE && (
        <HTEDetailsModal
          hte={toHTE(selectedHTE)}
          onClose={() => setSelectedHTE(null)}
          onEdit={() => {
            setEditingHTE(selectedHTE);
            setSelectedHTE(null);
          }}
          hteId={selectedHTE.id}
          onSuccess={() => {
            setSelectedHTE(null);
            showMessage("success", "Deleted", "HTE has been deleted successfully.");
            router.refresh();
          }}
          onError={(msg) => {
            showMessage("error", "Delete Failed", msg);
          }}
        />
      )}

      {editingHTE && (
        <HTEFormModal
          hte={toHTE(editingHTE)}
          hteId={editingHTE.id}
          onClose={() => setEditingHTE(null)}
          onSuccess={() => {
            setEditingHTE(null);
            showMessage("success", "Updated", "HTE has been updated successfully.");
            router.refresh();
          }}
          onError={(msg) => {
            showMessage("error", "Update Failed", msg);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterHTEModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            setShowRegisterModal(false);
            showMessage("success", "Created", "HTE has been registered successfully.");
            router.refresh();
          }}
          onError={(msg) => {
            showMessage("error", "Create Failed", msg);
          }}
        />
      )}

      <ActionModal
        open={showActionModal}
        type={actionType}
        title={actionTitle}
        message={actionMessage}
        onClose={() => setShowActionModal(false)}
      />
    </div>
  );
}
