"use client";
import { useMemo, useState } from "react";
import HTEFormModal from "@/components/modals/HTEFormModal";
import RegisterHTEModal from "@/components/modals/RegisterHTEModal";
import SearchBar from "@/components/search/SearchBar";
import HTETable from "@/components/table/HTETable";
import type { HTE } from "@/lib/types";
import HTEDetailsModal from "@/components/modals/HTEDetailsModal";

interface Props {
  initialHTEs: HTE[];
}

export default function HTEManagementClient({
  initialHTEs,
}: Props) {
  const [selectedHTE, setSelectedHTE] = useState<HTE | null>(null);
  const [editingHTE, setEditingHTE] = useState<HTE | null>(null);
  const [htes, setHTEs] = useState(initialHTEs);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredHTEs = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return htes;

    return htes.filter((hte) => {
      return (
        hte.company
          .toLowerCase()
          .includes(keyword) ||

        hte.address
          .toLowerCase()
          .includes(keyword) ||

        (hte.contactPerson ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (hte.email ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (hte.phone ?? "")
          .toLowerCase()
          .includes(keyword) ||

        (hte.workSchedule ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [htes, search]);

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

        <SearchBar
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* Table */}
      <HTETable
        data={filteredHTEs}
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