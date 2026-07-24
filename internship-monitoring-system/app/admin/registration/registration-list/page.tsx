"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import { Intern } from '@/lib/types';
import { getAcademicPageData } from '@/lib/services/admin/academic';
import { getAdminRegistrations } from '@/lib/services/admin/registrations';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [Data, setData] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [academicData, registrations] = await Promise.all([
          getAcademicPageData(),
          getAdminRegistrations(),
        ]);
        setCurrentActiveYear(academicData.activeSchoolYear?.academicYear ?? '');
        setYearOptions(academicData.yearOptions);
        setSemesterOptions(academicData.semesterOptions);
        setData(registrations);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Registration List</h1>
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
      <TableLayout<Intern> title='Student List' buttonTitle='' data={Data} onClick={() => {}}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading}
            columns={['name', 'email', 'course', 'section', 'status']}
            onRowClick={() => router.push(`/admin/intern`)}
          />
        )}
      </TableLayout>
    </main>
  );
}
