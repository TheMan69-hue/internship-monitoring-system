"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { SchoolYear } from '@/lib/types';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewSchoolYear from '@/components/modals/AddNewSchoolYear';
import { createClient } from '@/lib/supabase/client';
import { getAcademicPageData } from '@/lib/services/admin/academic';
import {
  createSchoolYear,
  deleteSchoolYear,
  setActiveSchoolYear as setActiveSchoolYearAction,
  deactivateSchoolYear as deactivateSchoolYearAction,
  updateSchoolYear as updateSchoolYearAction,
} from '@/lib/actions/academic';

export default function Dashboard() {
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [Data, setData] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<SchoolYear | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();
  const [schoolYearOptions, setSchoolYearOptions] = useState<{ value: string; label: string }[]>([]);

  // ── Data Fetcher ──
  // Fetches school years directly from the school_years table.
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("school_years")
        .select("id, name, is_active, start_date, end_date")
        .order("start_date", { ascending: true });

      if (error) throw error;

      const mappedData: SchoolYear[] = (data ?? []).map((year) => ({
        id: year.id ?? "",
        schoolYearId: year.id ?? "",
        academicYear: year.name ?? "Unknown School Year",
        is_active: Boolean(year.is_active),
        status: Boolean(year.is_active) ? "active" : "inactive",
        startDate: year.start_date ?? undefined,
        endDate: year.end_date ?? undefined,
      }));

      setData(mappedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const academicData = await getAcademicPageData();
        setActiveSchoolYear(academicData.activeSchoolYear);

        const supabase = createClient();
        const { data: schoolYears } = await supabase
          .from("school_years")
          .select("id, name")
          .order("start_date", { ascending: true });
        const options = (schoolYears ?? []).map((y) => ({
          value: y.id,
          label: y.name ?? "Unnamed School Year",
        }));
        setSchoolYearOptions(options);

        await fetchData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (data: { name: string; start_date: string; end_date: string }) => {
    setActionLoading(true);
    try {
      let result;
      if (editData) {
        result = await updateSchoolYearAction(editData.id, data);
      } else {
        result = await createSchoolYear(data);
      }

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? (editData ? 'Failed to update school year.' : 'Failed to create school year.'));
      }
    } finally {
      setActionLoading(false);
      setEditData(null);
    }
  };

  const handleEdit = (row: SchoolYear) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.academicYear}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  const handleSetActive = async (row: SchoolYear) => {
    if (row.is_active) {
      const confirmDeactivate = window.confirm(
        `Remove active status from "${row.academicYear}"? This will also deactivate its semesters.`
      );
      if (!confirmDeactivate) return;

      setActionLoading(true);
      try {
        await deactivateSchoolYearAction(String(row.id));
        await fetchData();
        window.dispatchEvent(new CustomEvent('academic-data-changed'));
      } finally {
        setActionLoading(false);
      }
      return;
    }

    const currentActive = Data.find((item) => item.is_active);
    if (currentActive) {
      const confirmSwitch = window.confirm(
        `"${currentActive.academicYear}" is currently active. Switch to "${row.academicYear}" instead?`
      );
      if (!confirmSwitch) return;
    }

    setActionLoading(true);
    try {
      await setActiveSchoolYearAction(String(row.id));
      await fetchData();
      window.dispatchEvent(new CustomEvent('academic-data-changed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (row: SchoolYear) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.academicYear}"? This will also delete all semesters under it. This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteSchoolYear(String(row.id));

      if (result.success) {
        await fetchData();
        window.dispatchEvent(new CustomEvent('academic-data-changed'));
      } else {
        alert(result.message ?? 'Failed to delete school year.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black mb-5'>
        <h1>Academic Record List</h1>
      </div>
      <div>
        <TableLayout<SchoolYear> title='Academic Year' buttonTitle='+' showButton={true} data={Data} onClick={() => { setEditData(null); setShowModal(true); }} searchKeys={['academicYear', 'status']}>
          {(pagedData) => (
            <ReusableTable
              data={pagedData}
              isLoading={isLoading || actionLoading}
              columns={['academicYear', 'startDate', 'endDate', 'status']}
              onRowClick={(row) => router.push(`/admin/registration/archive-list/semester-list?schoolYearId=${row.schoolYearId}&schoolYearName=${encodeURIComponent(row.academicYear)}`)}
              showActions
              actions={[
                { label: 'Edit', onClick: (row) => handleEdit(row) },
                { label: (row) => row.is_active ? 'Remove Active Status' : 'Set as Active', onClick: (row) => handleSetActive(row) },
                { label: 'Delete', onClick: (row) => handleDelete(row) },
              ]}
            />
          )}
        </TableLayout>
      </div>
      {showModal && (
        <AddNewSchoolYear
          key={editData?.id ?? 'new'}
          show={showModal}
          onSubmit={handleAdd}
          existingNames={schoolYearOptions.map((o) => o.label)}
          editData={editData}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }} />
      )}
    </main>
  );
}
