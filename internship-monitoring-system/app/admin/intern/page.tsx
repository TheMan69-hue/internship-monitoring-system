"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Student } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';

const Modal = dynamic(() => import('@/components/modals/Modal'), { ssr: false });
import DetailField from '@/components/ui/DetailField';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';
import { fetchStudents } from '@/lib/actions/students';

type AcademicOption = { value: string; label: string };

export default function InternPage() {
  const [Data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<AcademicOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<AcademicOption[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load: Single-pass fetch ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Step 1: get academic data first to know the active period
        const academicData = await getAcademicPageData();
        setYearOptions(academicData.yearOptions);

        const active = academicData.activeSchoolYear;
        let filters: { year: string; semester: string } | undefined;
        let year = '';
        let semester = '';

        if (active && active.schoolYearId && active.id) {
          year = String(active.schoolYearId);
          semester = String(active.id);
          setSelectedYear(year);
          setSelectedSemester(semester);
          filters = { year, semester };
        }

        // Step 2: single batch — only ONE students call
        const [students, semesterOpts] = await Promise.all([
          fetchStudents(filters),
          year ? getSemestersBySchoolYear(year) : Promise.resolve([]),
        ]);

        setData(students);

        if (semesterOpts.length > 0) {
          setSemesterOptions(semesterOpts);
          setSemesterDisabled(false);
        }
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

    // ── Module reset: close modals, clear selections ──
    setSelectedStudent(null);
    setShowModal(false);
    setIsLoading(true);

    try {
      // ── Refresh reference data ──
      const semesterOpts = await getSemestersBySchoolYear(year);
      setSemesterOptions(semesterOpts);
      setSemesterDisabled(false);

      // ── Re-fetch main data with filters ──
      const filters = { year, semester };
      const students = await fetchStudents(filters);
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
      <TableLayout<Student> title="All Interns" data={Data} searchKeys={['name', 'email', 'program', 'studentNumber']}>
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
        <Modal title="Intern Details" onClose={() => { setShowModal(false); setSelectedStudent(null); }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
            <DetailField label="Full Name" value={selectedStudent.name} />
            <DetailField label="Student Number" value={selectedStudent.studentNumber} />
            <DetailField label="Email" value={selectedStudent.email} />
            <DetailField label="Program" value={selectedStudent.program} />
            <DetailField label="Section" value={selectedStudent.section} />
            <DetailField label="Contact Number" value={selectedStudent.contactNumber} />
            {selectedStudent.hte && <DetailField label="HTE Company" value={selectedStudent.hte.companyName} />}
            {selectedStudent.schedule && (
              <>
                <DetailField label="Expected Time In" value={selectedStudent.schedule.expectedTimeIn} />
                <DetailField label="Expected Time Out" value={selectedStudent.schedule.expectedTimeOut} />
                <DetailField label="Required Hours" value={String(selectedStudent.schedule.requiredHours)} />
              </>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
}
