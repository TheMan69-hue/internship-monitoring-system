"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import { Intern } from '@/lib/types';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';
import { getAdminRegistrations } from '@/lib/services/admin/registrations';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [Data, setData] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  // ── Academic Year / Semester Filter State ──
  // Same pattern as the dashboard — year options load on mount,
  // semester options are fetched on-demand when a year is selected.
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load: Fetch academic year options and all registrations ──
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [academicData, registrations] = await Promise.all([
          getAcademicPageData(),
          getAdminRegistrations(),
        ]);
        setYearOptions(academicData.yearOptions);
        setData(registrations);

        // Auto-select active school year and semester
        const active = academicData.activeSchoolYear;
        if (active && active.schoolYearId && active.id) {
          setSelectedYear(String(active.schoolYearId));
          setSelectedSemester(String(active.id));

          const semesters = await getSemestersBySchoolYear(String(active.schoolYearId));
          setSemesterOptions(semesters);
          setSemesterDisabled(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Year Change Handler ──
  // When user picks a year, fetch its semesters and enable the semester dropdown.
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

  // ── Load Button Handler ──
  // Re-fetches registration data filtered by the selected year+semester.
  const handleLoad = async (year: string, semester: string) => {
    if (!year || !semester) return;
    setIsLoading(true);
    try {
      const filters = { year, semester };
      const registrations = await getAdminRegistrations(filters);
      setData(registrations);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Registration List</h1>
      </div>
      <div>
        {/* ── Academic Year / Semester Filter ──
            Year populated on load, semester on year-select, button applies filter. */}
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
      <TableLayout<Intern> title='Student List' data={Data} searchKeys={['name', 'email', 'course', 'section']}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading}
            selectable
            columns={['name', 'email', 'course', 'section', 'status']}
            onRowClick={() => router.push(`/admin/intern`)}
          />
        )}
      </TableLayout>
    </main>
  );
}
