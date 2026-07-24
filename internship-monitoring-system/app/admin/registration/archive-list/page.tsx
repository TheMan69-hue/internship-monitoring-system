"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import { SchoolYear } from '@/lib/types';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewSchoolYear from '@/components/modals/AddNewSchoolYear';
import { getAcademicPageData } from '@/lib/services/admin/academic';
import {
  createSchoolYear,
  deleteSchoolYear,
  setActiveSchoolYear as setActiveSchoolYearAction,
} from '@/lib/actions/academic';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [Data, setData] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<SchoolYear | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const academicData = await getAcademicPageData();
      setData(academicData.schoolYears);
      setYearOptions(academicData.yearOptions);
      setSemesterOptions(academicData.semesterOptions);
      setActiveSchoolYear(academicData.activeSchoolYear);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const academicData = await getAcademicPageData();
        setData(academicData.schoolYears);
        setYearOptions(academicData.yearOptions);
        setSemesterOptions(academicData.semesterOptions);
        setActiveSchoolYear(academicData.activeSchoolYear);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (newData: Omit<SchoolYear, 'id'> & { id?: string }) => {
    setActionLoading(true);
    try {
      const result = await createSchoolYear({
        name: newData.academicYear,
        start_date: newData.startDate ?? '',
        end_date: newData.endDate ?? '',
      });

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to create school year.');
      }
    } finally {
      setActionLoading(false);
      setEditData(null);
    }
  };

  const handleEdit = (row: SchoolYear) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.academicYear} - ${row.semester}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  const handleSetActive = async (row: SchoolYear) => {
    if (row.is_active) {
      setActionLoading(true);
      try {
        await setActiveSchoolYearAction(String(row.id));
        await fetchData();
      } finally {
        setActionLoading(false);
      }
      return;
    }

    const currentActive = Data.find((item) => item.is_active);
    if (currentActive) {
      const confirmSwitch = window.confirm(
        `"${currentActive.academicYear} - ${currentActive.semester}" is currently active. Switch to "${row.academicYear} - ${row.semester}" instead?`
      );
      if (!confirmSwitch) return;
    }

    setActionLoading(true);
    try {
      await setActiveSchoolYearAction(String(row.id));
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (row: SchoolYear) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.academicYear} - ${row.semester}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteSchoolYear(String(row.id));

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to delete school year.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Academic Year List</h1>
        <h1>{activeSchoolYear?.academicYear || 'No Active Academic Year'}</h1>
      </div>
      <div>
        <YearFilter
          yearLabel="Academic Year"
          yearOptions={yearOptions}
          yearValue={selectedYear}
          onYearChange={setSelectedYear}
          semesterLabel="Semester"
          semesterOptions={semesterOptions}
          semesterValue={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />
      </div>
      <TableLayout<SchoolYear> title='Academic Year' buttonTitle='+' data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading || actionLoading}
            columns={['academicYear', 'semester', 'status']}
            onRowClick={() => router.push(`/admin/registration/archive-list/program-list`)}
            showActions
            actions={[
              { label: 'Edit', onClick: (row) => handleEdit(row) },
              { label: (row) => row.is_active ? 'Remove Active Status' : 'Set as Active', onClick: (row) => handleSetActive(row) },
              { label: 'Delete', onClick: (row) => handleDelete(row) },
            ]}
          />
        )}
      </TableLayout>
      {showModal && (
        <AddNewSchoolYear
          key={editData?.id ?? 'new'}
          show={showModal}
          onSubmit={handleAdd}
          activeSchoolYear={activeSchoolYear}
          existingRecords={Data}
          editData={editData}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }} />
      )}
    </main>
  );
}
