"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TableLayout from "@/components/layout/TablePageLayout";
import ReusableTable from "@/components/table/Table";
import AddNewProgram from "@/components/modals/AddNewProgram";
import { createClient } from "@/lib/supabase/client";
import { deleteProgram } from "@/lib/actions/programs";
import { ChevronLeft } from 'lucide-react';

type AdminProgram = {
  id: string;
  name: string;
  required_hours: number;
  Total_Interns?: number;
  Total_Coordinator?: number;
};

function ProgramListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const semesterName = searchParams.get("semesterName") ?? "Unknown Semester";

  const [Data, setData] = useState<AdminProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<AdminProgram | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data: programsData, error: programsError } = await supabase
        .from("programs")
        .select("id, program_name, required_hours")
        .order("created_at", { ascending: true });

      if (programsError) throw programsError;

      const programIds = (programsData ?? []).map((p) => p.id);

      const [{ data: studentCounts }, { data: coordinatorCounts }] =
        await Promise.all([
          supabase
            .from("students")
            .select("program_id")
            .in("program_id", programIds),
          supabase
            .from("coordinator_assignments")
            .select("program_id")
            .in("program_id", programIds),
        ]);

      const studentsByProgram = new Map<string, number>();
      (studentCounts ?? []).forEach((row) => {
        studentsByProgram.set(
          row.program_id,
          (studentsByProgram.get(row.program_id) ?? 0) + 1
        );
      });

      const coordinatorsByProgram = new Map<string, number>();
      (coordinatorCounts ?? []).forEach((row) => {
        coordinatorsByProgram.set(
          row.program_id,
          (coordinatorsByProgram.get(row.program_id) ?? 0) + 1
        );
      });

      const mapped: AdminProgram[] = (programsData ?? []).map((p) => ({
        id: p.id ?? "",
        name: p.program_name ?? "Unnamed Program",
        required_hours: p.required_hours ?? 0,
        Total_Interns: studentsByProgram.get(p.id) ?? 0,
        Total_Coordinator: coordinatorsByProgram.get(p.id) ?? 0,
      }));

      setData(mapped);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const handleEditClick = (row: AdminProgram) => {
    setEditData(row);
    setShowModal(true);
  };

  const handleDelete = async (row: AdminProgram) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteProgram(String(row.id));
      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? "Failed to delete program.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditData(null);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className="flex flex-row gap-2 items-center text-black mb-5">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-800"
        >
          <ChevronLeft />
        </button>
        <h1>{semesterName} — Programs</h1>        
      </div>
      <TableLayout<AdminProgram>
        title="Programs"
        buttonTitle="+"
        showButton={true}
        data={Data}
        onClick={handleAddClick}
        searchKeys={['name']}
      >
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading || actionLoading}
            columns={["name", "required_hours", "Total_Interns", "Total_Coordinator"]}
            showActions
            actions={[
              { label: "Edit", onClick: (row) => handleEditClick(row) },
              { label: "Delete", onClick: (row) => handleDelete(row) },
            ]}
          />
        )}
      </TableLayout>
      {showModal && (
        <AddNewProgram
          key={editData?.id ?? "new"}
          show={showModal}
          onSuccess={() => {
            fetchData();
            setEditData(null);
          }}
          editData={editData}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
        />
      )}
    </main>
  );
}

export default function ProgramListPage() {
  return (
    <Suspense fallback={<div className="p-5">Loading...</div>}>
      <ProgramListContent />
    </Suspense>
  );
}
