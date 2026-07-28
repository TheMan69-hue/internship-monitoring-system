"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TableLayout from "@/components/layout/TablePageLayout";
import ReusableTable from "@/components/table/Table";
import AddNewSemester from "@/components/modals/AddNewSemester";
import { createClient } from "@/lib/supabase/client";
import {
  deleteSemester,
  setActiveSemester as setActiveSemesterAction,
  deactivateSemester as deactivateSemesterAction,
} from "@/lib/actions/academic";

type SemesterRow = {
  id: string;
  name: string;
  is_active: boolean;
  status: "active" | "inactive";
  start_date: string | null;
  end_date: string | null;
  schoolYearId: string;
  schoolYearName: string;
};

export default function SemesterListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolYearId = searchParams.get("schoolYearId") ?? "";
  const schoolYearName = searchParams.get("schoolYearName") ?? "Unknown School Year";

  const [Data, setData] = useState<SemesterRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<SemesterRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!schoolYearId) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("semesters")
        .select("id, name, is_active, start_date, end_date")
        .eq("school_year_id", schoolYearId)
        .order("start_date", { ascending: true });

      if (error) throw error;

      const mapped: SemesterRow[] = (data ?? []).map((sem) => ({
        id: sem.id ?? "",
        name: sem.name ?? "Unnamed Semester",
        is_active: Boolean(sem.is_active),
        status: Boolean(sem.is_active) ? "active" : "inactive",
        start_date: sem.start_date,
        end_date: sem.end_date,
        schoolYearId: schoolYearId,
        schoolYearName: schoolYearName,
      }));

      setData(mapped);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    } finally {
      setIsLoading(false);
    }
  }, [schoolYearId, schoolYearName]);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const handleSetActive = async (row: SemesterRow) => {
    // If already active, deactivate it
    if (row.is_active) {
      const confirmDeactivate = window.confirm(
        `Remove active status from "${row.name}"?`
      );
      if (!confirmDeactivate) return;

      setActionLoading(true);
      try {
        const result = await deactivateSemesterAction(row.id);
        if (result.success) {
          await fetchData();
        } else {
          alert(result.message ?? "Failed to deactivate semester.");
        }
      } finally {
        setActionLoading(false);
      }
      return;
    }

    const currentActive = Data.find((item) => item.is_active);
    if (currentActive) {
      const confirmSwitch = window.confirm(
        `"${currentActive.name}" is currently active. Switch to "${row.name}" instead?`
      );
      if (!confirmSwitch) return;
    }

    setActionLoading(true);
    try {
      const result = await setActiveSemesterAction(row.id);
      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? "Failed to set active semester.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (row: SemesterRow) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteSemester(row.id);
      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? "Failed to delete semester.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (row: SemesterRow) => {
    setEditData(row);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className="flex flex-row justify-between items-center text-black mb-5">
        <h1>{schoolYearName} — Semesters</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Academic Records
        </button>
      </div>
      <TableLayout<SemesterRow>
        title="Semesters"
        buttonTitle="+"
        data={Data}
        onClick={handleAdd}
      >
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading || actionLoading}
            columns={["name", "start_date", "end_date", "status"]}
            onRowClick={(row) => router.push(`/admin/registration/archive-list/program-list?schoolYearId=${schoolYearId}&semesterId=${row.id}&schoolYearName=${encodeURIComponent(schoolYearName)}&semesterName=${encodeURIComponent(row.name)}`)}
            showActions
            actions={[
              {
                label: "Edit",
                onClick: (row) => handleEdit(row),
              },
              {
                label: (row) => row.is_active ? "Remove Active Status" : "Set as Active",
                onClick: (row) => handleSetActive(row),
              },
              {
                label: "Delete",
                onClick: (row) => handleDelete(row),
              },
            ]}
          />
        )}
      </TableLayout>
      {showModal && (
        <AddNewSemester
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          onSuccess={() => {
            fetchData();
            setEditData(null);
          }}
          yearOptions={[{ value: schoolYearId, label: schoolYearName }]}
          editData={editData}
          schoolYearId={schoolYearId}
        />
      )}
    </main>
  );
}
