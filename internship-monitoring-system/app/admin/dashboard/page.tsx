"use client";

import { useState } from 'react';
import YearFilter from '@/components/table/YearFilter';


export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');


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

  return (
      <main className=" flex flex-col flex-1 h-full p-5">
          <div className='flex flex-row justify-between items-center'>
            <h1>Dashboard</h1>
            <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
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
          <div className='bg-blue-500 rounded-lg w-full h-full'>
            <p>hello world</p>
          </div>
      </main>
  );
}