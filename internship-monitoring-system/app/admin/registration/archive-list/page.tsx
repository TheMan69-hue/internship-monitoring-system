"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import { SchoolYear } from '@/lib/types';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewSchoolYear from '@/components/modals/AddNewSchoolYear';
import { getAcademicPageData } from '@/lib/services/admin/academic';



export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [activeSchoolYear, setActiveSchoolYear] = useState<SchoolYear | null>(null);
  const [Data, setData] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<SchoolYear | null>(null);

  const router = useRouter();
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);

  // Fetch current active year and SchoolYears from database
  useEffect(() => {
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

    fetchData();
  }, []);

  // Create new entry or update existing
  const handleAdd = (newData: Omit<SchoolYear, 'id'> & { id?: number }) => {
    setData((prev) => {
      // If editing, replace the existing entry
      if (newData.id !== undefined) {
        return prev.map((item) => (item.id === newData.id ? newData as SchoolYear : item));
      }
      // If adding new, append
      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { ...newData, id: newId } as SchoolYear];
    });
    setEditData(null);
  };
  
  // Update entry with confirmation
  const handleEdit = (row: SchoolYear) => {
    const confirmEdit = window.confirm(
      `Are you sure you want to edit "${row.academicYear} - ${row.semester}"?`
    );
    if (!confirmEdit) return;
    setEditData(row);
    setShowModal(true);
  };

  // Set/remove active status (only one can be active at a time)
  const handleSetActive = (row: SchoolYear) => {
    // If already active, just deactivate
    if (row.is_active) {
      setData((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, is_active: false, status: 'inactive' as const } : item
        )
      );
      setActiveSchoolYear(null);
      return;
    }

    // Check if another entry is already active
    const currentActive = Data.find((item) => item.is_active);
    if (currentActive) {
      const confirmSwitch = window.confirm(
        `"${currentActive.academicYear} - ${currentActive.semester}" is currently active. Switch to "${row.academicYear} - ${row.semester}" instead?`
      );
      if (!confirmSwitch) return;
    }

    setData((prev) =>
      prev.map((item) => ({
        ...item,
        is_active: item.id === row.id,
        status: item.id === row.id ? 'active' as const : 'inactive' as const,
      }))
    );
    setActiveSchoolYear({ ...row, is_active: true, status: 'active' });
  };

  // Delete entry with confirmation
  const handleDelete = (row: SchoolYear) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.academicYear} - ${row.semester}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    setData((prev) => prev.filter((item) => item.id !== row.id));
  };

  return (
    //TODO: change route page
    <main className=" flex flex-col flex-1 h-full p-5">
        <div className='flex flex-row justify-between items-center text-black'>
          <h1>Academic Year List</h1>
          <h1>{ activeSchoolYear?.academicYear || 'No Active Academic Year'}</h1>
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
        <TableLayout<SchoolYear> title='Academic Year' buttonTitle='+'  data={Data} onClick={() => { setEditData(null); setShowModal(true); }}>
          {(pagedData) => (
            <ReusableTable
              data={pagedData} 
              isLoading={isLoading}
              columns={['academicYear', 'semester', 'status',]}
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