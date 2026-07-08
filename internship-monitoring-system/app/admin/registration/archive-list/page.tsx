"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import StudentLists, { type Intern } from '@/components/table/StudentLists';
import { mockStudentLists } from '@/lib/studentLists';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const yearOptions = [
    { value: '2024', label: '2024-2025' },
    { value: '2025', label: '2025-2026' },
    { value: '2026', label: '2026-2027' },
  ];

  const semesterOptions = [
    { value: '1st', label: '1st Semester' },
    { value: '2nd', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' },
  ];

  // Fetch current active year and interns from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls to your database
        setCurrentActiveYear('2024');
        setInterns(mockStudentLists);
        // setInterns(await fetchInternsFromDB());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
        <main className=" flex flex-col">
            <div className='flex flex-row justify-between items-center'>
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
            <StudentLists data={interns} isLoading={isLoading} onRowClick={(intern) => router.push(`/interns/${intern.id}`)}/>
        </main>
    </div>
  );
}