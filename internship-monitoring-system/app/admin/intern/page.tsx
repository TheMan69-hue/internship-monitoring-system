"use client";

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import StudentDetailsModal from '@/components/modals/StudentDetailsModal';
import { getAllStudents } from '@/lib/services/admin/students';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';

export default function InternPage() {
  const [Data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  const filteredData = searchQuery.trim()
    ? Data.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Data;

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [students, academicData] = await Promise.all([
          getAllStudents(),
          getAcademicPageData(),
        ]);
        setData(students);
        setCurrentActiveYear(academicData.activeSchoolYear?.academicYear ?? '');
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
    setIsLoading(true);
    try {
      const filters = { year, semester };
      const students = await getAllStudents(filters);
      setData(students);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className="flex flex-row justify-between items-center text-black mb-5">
        <h1>Intern Management</h1>
        <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
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
      <div className="flex flex-row justify-end mb-3">
        <input
          type="text"
          placeholder="Search by name, number, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <TableLayout<Student> title="All Interns" buttonTitle="" data={filteredData} onClick={() => {}}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading}
            columns={['studentNumber', 'name', 'program', 'section', 'email']}
            onRowClick={handleRowClick}
          />
        )}
      </TableLayout>
      {showModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </main>
  );
}
