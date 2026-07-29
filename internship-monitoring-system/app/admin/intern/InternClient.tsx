"use client";

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import Modal from '@/components/modals/Modal';
import DetailField from '@/components/ui/DetailField';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';

type InternClientProps = {
  initialStudents: Student[];
};

type AcademicOption = { value: string; label: string };

export default function InternClient({ initialStudents }: InternClientProps) {
  const [Data] = useState<Student[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<AcademicOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<AcademicOption[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      try {
        const academicData = await getAcademicPageData();
        setYearOptions(academicData.yearOptions);
      } catch (error) {
        console.error('Error fetching academic data:', error);
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
      // For now re-fetch is not implemented; data is already loaded
      console.log('Filter by:', year, semester);
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
