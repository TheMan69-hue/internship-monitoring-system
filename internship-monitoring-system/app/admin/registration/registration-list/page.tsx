"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import { mockSchoolYearLists } from '@/lib/schoolyear';
import { mockStudentLists } from '@/lib/studentLists';
import AddNewSchoolYear from '@/components/modals/AddNewSchoolYear';
import Button from '@/components/buttons/buttons';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import { Intern } from '@/lib/types';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [Data, setData] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  //TODO: Replace school_year data here from database
  const yearOptions = [
    { value: '2024', label: '2024-2025' },
    { value: '2025', label: '2025-2026' },
    { value: '2026', label: '2026-2027' },
  ];

    //TODO: Replace semesters data from database here 
  const semesterOptions = [
    { value: '1st', label: '1st Semester' },
    { value: '2nd', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' },
  ];


  // Fetch current active year and SchoolYears from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls to database
        setCurrentActiveYear('2024');
        setData(mockStudentLists);
        // setSchoolYears(await fetchSchoolYearsFromDB());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new entry TODO: modal for add
  // const handleAdd = (newSchoolYear) => {
  //   setSchoolYears((prev) => {
  //     const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
  //     return [...prev, { ...newSchoolYear, id: newId }];
  //   });
  // };
  
  // Update entry TODO: modal for edit
  // const handleUpdate = (id: number, updated: Partial<SchoolYear>) => {
  //   SchoolYears.map((y) => (y.id === id ? {...y, ...updated} : y))
  // }; 

  return (
    //TODO: change route page
    <main className=" flex flex-col flex-1 h-full p-5">
        <div className='flex flex-row justify-between items-center text-black'>
          <h1>Archive List</h1>
          <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
        </div>
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
        <TableLayout<Intern> title='Section List' buttonTitle='+'  data={Data} onClick={() => setShowModal(true)}>
          {(pagedData) => (
            <ReusableTable
              data={pagedData} 
              isLoading={isLoading}
              columns={['name', 'email', 'course', 'academicYear', 'semester', 'status']}
              onRowClick={() => router.push(`/admin/intern`)}
            />
          )}
        </TableLayout>
        {showModal && (
          <AddNewSchoolYear show={showModal} onClose={() => setShowModal(false)} />
        )}
    </main>
  );
}