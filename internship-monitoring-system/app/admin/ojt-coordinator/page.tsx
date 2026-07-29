"use client";

import { useState, useEffect, useCallback } from 'react';
import { Coordinator } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import AddNewCoordinator from '@/components/modals/AddNewCoordinator';
import { getCoordinators, getSectionOptions } from '@/lib/services/admin/coordinators';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';
import { deleteCoordinator } from '@/lib/actions/coordinators';

export default function Dashboard() {
  const [Data, setData] = useState<Coordinator[]>([]);
  const [sectionOptions, setSectionOptions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Coordinator | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  const fetchData = useCallback(async (year?: string, semester?: string) => {
    setIsLoading(true);
    try {
      const filters = year ? { year, semester } : undefined;
      const [coordinators, sections] = await Promise.all([
        getCoordinators(filters),
        getSectionOptions(),
      ]);
      setData(coordinators);
      setSectionOptions(sections);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [coordinators, sections, academicData] = await Promise.all([
          getCoordinators(),
          getSectionOptions(),
          getAcademicPageData(),
        ]);
        setData(coordinators);
        setSectionOptions(sections);
        setYearOptions(academicData.yearOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    setSelectedSemester('');
    setSemesterDisabled(true);
    if (year) {
      try {
        const semesters = await getSemestersBySchoolYear(year);
        setSemesterOptions(semesters);
        setSemesterDisabled(false);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setSemesterOptions([]);
      }
    } else {
      setSemesterOptions([]);
    }
  };

  const handleLoad = async (year: string, semester: string) => {
    if (!year || !semester) return;
    await fetchData(year, semester);
  };

  const handleDelete = async (row: Coordinator) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const result = await deleteCoordinator(String(row.id));

      if (result.success) {
        await fetchData();
      } else {
        alert(result.message ?? 'Failed to delete coordinator.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (row: Coordinator) => {
    setEditData(row);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditData(null);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black mb-5'>
        <h1>OJT Coordinator List</h1>
      </div>
      <div>
        <YearFilter
          yearLabel="Academic Year"
          yearOptions={yearOptions}
          yearValue={selectedYear}
          onYearChange={handleYearChange}
          semesterLabel="Semester"
          semesterOptions={semesterOptions}
          semesterValue={selectedSemester}
          onSemesterChange={setSelectedSemester}
          onLoad={handleLoad}
          semesterDisabled={semesterDisabled}
        />
      </div>
      <TableLayout<Coordinator> title='Coordinator List' buttonTitle='+' showButton={true} data={Data} onClick={handleAddClick} searchKeys={['name', 'email', 'contact_num']}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading || actionLoading}
            columns={['name', 'email', 'contact_num']}
            showActions
            actions={[
              { label: 'Edit', onClick: (row) => handleEditClick(row) },
              { label: 'Delete', onClick: (row) => handleDelete(row) },
            ]}
          />
        )}
      </TableLayout>
      {showModal && (
        <AddNewCoordinator
          key={editData?.id ?? 'new'}
          show={showModal}
          onSuccess={() => {
            fetchData();
            setEditData(null);
          }}
          editData={editData}
          sectionOptions={sectionOptions}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
        />
      )}
    </main>
  );
}
