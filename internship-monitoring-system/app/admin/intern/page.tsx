"use client";

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';
import { getSectionOptions } from '@/lib/services/admin/coordinators';
import { fetchStudents, updateInternDetails } from '@/lib/actions/students';
import InternDetailsModal from '@/components/modals/InternDetailsModal';
import EditInternDetailsModal from '@/components/modals/EditInternDetailsModal';

type AcademicOption = { value: string; label: string };

export default function InternPage() {
  const [Data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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
        // Step 1: get academic data and shared reference options.
        const [academicData, sections] = await Promise.all([
          getAcademicPageData(),
          getSectionOptions(),
        ]);
        setYearOptions(academicData.yearOptions);
        setSectionOptions(sections.map((section) => section.name));

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
    setEditModalOpen(false);
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
    setEditModalOpen(false);
    setEditError('');
  };

  const openEditModal = () => {
    setEditError('');
    setShowModal(false);
    setEditModalOpen(true);
  };

  const closeDetailsModal = () => {
    setShowModal(false);
    setEditModalOpen(false);
    setSelectedStudent(null);
    setEditError('');
  };

  const cancelEditModal = () => {
    setEditError('');
    setEditModalOpen(false);
    setShowModal(true);
  };

  const handleSaveIntern = async (data: {
    fullName: string;
    email: string;
    program: string;
    section: string;
    password?: string;
  }) => {
    if (!selectedStudent) {
      return;
    }

    setEditLoading(true);
    setEditError('');

    const studentId = selectedStudent.id;
    const result = await updateInternDetails(studentId, data);
    setEditLoading(false);

    if (!result.success) {
      setEditError(result.message ?? 'Failed to update intern details.');
      return;
    }

    setData((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              name: data.fullName,
              email: data.email,
              program: data.program,
              section: data.section,
            }
          : student
      )
    );

    setSelectedStudent((current) =>
      current
        ? {
            ...current,
            name: data.fullName,
            email: data.email,
            program: data.program,
            section: data.section,
          }
        : current
    );

    setEditModalOpen(false);
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
        <InternDetailsModal
          student={selectedStudent}
          onClose={closeDetailsModal}
          onEdit={openEditModal}
        />
      )}

      {editModalOpen && selectedStudent && (
        <EditInternDetailsModal
          student={selectedStudent}
          sections={sectionOptions}
          loading={editLoading}
          errorMessage={editError}
          onClose={closeDetailsModal}
          onCancel={cancelEditModal}
          onSave={handleSaveIntern}
        />
      )}
    </main>
  );
}
