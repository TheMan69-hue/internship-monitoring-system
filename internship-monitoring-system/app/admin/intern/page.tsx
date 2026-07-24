"use client";

import { useState, useEffect } from 'react';
import { Student } from '@/lib/types';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import StudentDetailsModal from '@/components/modals/StudentDetailsModal';
import { getAllStudents } from '@/lib/services/admin/students';

export default function InternPage() {
  const [Data, setData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = searchQuery.trim()
    ? Data.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Data;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const students = await getAllStudents();
        setData(students);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className="flex flex-row justify-between items-center text-black mb-5">
        <h1>Intern Management</h1>
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
