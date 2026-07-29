"use client";

import { useState, useEffect } from 'react';
import { Intern } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import Modal from '@/components/modals/Modal';
import DetailField from '@/components/ui/DetailField';
import { getAdminRegistrations } from '@/lib/services/admin/registrations';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';

export default function InternPage() {
  const [Data, setData] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Intern | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [registrations, academicData] = await Promise.all([
          getAdminRegistrations(),
          getAcademicPageData(),
        ]);
        setData(registrations);
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
      const registrations = await getAdminRegistrations(filters);
      setData(registrations);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (student: Intern) => {
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
      <TableLayout<Intern> title="All Interns" data={Data} searchKeys={['name', 'email', 'course']}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading}
            columns={['name', 'email', 'course', 'section', 'status']}
            onRowClick={handleRowClick}
          />
        )}
      </TableLayout>
      {showModal && selectedStudent && (
        <Modal title="Intern Details" onClose={() => { setShowModal(false); setSelectedStudent(null); }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-6">
            <DetailField label="Full Name" value={selectedStudent.name} />
            <DetailField label="Email" value={selectedStudent.email} />
            <DetailField label="Course" value={selectedStudent.course} />
            <DetailField label="Section" value={selectedStudent.section} />
            <DetailField label="Status" value={selectedStudent.status} />
            <DetailField label="Academic Year" value={selectedStudent.academicYear} />
            <DetailField label="Semester" value={selectedStudent.semester} />
            {selectedStudent.hte && <DetailField label="HTE Company" value={selectedStudent.hte} />}
          </div>
        </Modal>
      )}
    </main>
  );
}
