"use client";

import { useState } from "react";
import HTEFormModal from "@/components/modals/HTEFormModal";
import RegisterHTEModal from "@/components/modals/RegisterHTEModal";
import SearchBar from "@/components/search/SearchBar";
import HTETable from "@/components/table/HTETable";
import { hteData } from "@/lib/data/hte";
import type { HTE } from "@/lib/types";
import HTEDetailsModal from "@/components/modals/HTEDetailsModal";
export default function HTEManagementPage() {
  const [selectedHTE, setSelectedHTE] = useState<HTE | null>(null);
  const [editingHTE, setEditingHTE] = useState<HTE | null>(null);
  const [htes, setHTEs] = useState(hteData);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  return (
    <div>

      {/* Top Controls */}
      <div className="mb-6 flex items-center justify-between">

        <button
            onClick={() => setShowRegisterModal(true)}
            className="rounded-[10px] bg-[#2563EB] px-5 py-2 text-white transition hover:bg-[#1D4ED8]"
        >
            + Add HTE
        </button>

        <SearchBar />
      </div>

      {/* Table */}
      <HTETable
        data={htes}
        onRowClick={(hte) => setSelectedHTE(hte)}
      />
      {selectedHTE && (
        <HTEDetailsModal
          hte={selectedHTE}
          onClose={() => setSelectedHTE(null)}
          onEdit={() => {
            setEditingHTE(selectedHTE);
            setSelectedHTE(null);
      }}
        />
      )}
      {editingHTE && (
        <HTEFormModal
          hte={editingHTE}
          onClose={() => setEditingHTE(null)}
          onSave={(updatedHTE: HTE) => {

              setHTEs(
                  htes.map((hte) =>
                      hte.id === updatedHTE.id
                          ? updatedHTE
                          : hte
                  )
              );

              setEditingHTE(null);
          }}
        />
      )}
      {showRegisterModal && (
          <RegisterHTEModal
              onClose={() => setShowRegisterModal(false)}
          />
      )}

    </div>
  );
}