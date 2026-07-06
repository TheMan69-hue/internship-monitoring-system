"use client";

import { useState } from "react";
import RegisterHTEModal from "@/components/modals/RegisterHTEModal";
import SearchBar from "@/components/search/SearchBar";
import HTETable from "@/components/table/HTETable";
import { hteData } from "@/lib/hte";
import type { HTE } from "@/lib/types";
import HTEDetailsModal from "@/components/modals/HTEDetailsModal";
export default function HTEManagementPage() {
  const [selectedHTE, setSelectedHTE] = useState<HTE | null>(null);
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
        data={hteData}
        onRowClick={(hte) => setSelectedHTE(hte)}
      />
      {selectedHTE && (
        <HTEDetailsModal
          hte={selectedHTE}
          onClose={() => setSelectedHTE(null)}
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