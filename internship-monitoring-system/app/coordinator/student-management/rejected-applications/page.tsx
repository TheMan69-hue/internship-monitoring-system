"use client";

import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import DataTable from "@/components/table/DataTable";
import RegistrationDetailsModal from "@/components/modals/RegistrationDetailsModal";
import {
  rejectedApplications,
  rejectedApplicationColumns,
} from "@/lib/data/rejectedApplications";

export default function RejectedApplicationsPage() {
  const [students, setStudents] = useState(rejectedApplications);
  const [selectedStudent, setSelectedStudent] = useState<
    (typeof rejectedApplications)[0] | null
  >(null);

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Rejected Applications
      </h2>

      {/* Search */}

      <div className="mb-6 flex justify-end">
        <SearchBar />
      </div>

      {/* Table */}

      <DataTable columns={rejectedApplicationColumns}>

        {students.map((student) => (

          <tr
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="cursor-pointer border-t transition hover:bg-[#F3F4F6]"
          >

            <td className="px-6 py-4 text-[#111827]">
              {student.studentNumber}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.program}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.name}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.section}
            </td>

            <td className="px-6 py-4 text-[#111827]">
              {student.hte}
            </td>

          </tr>

        ))}

      </DataTable>
      {selectedStudent && (
        <RegistrationDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onApprove={() => {
            console.log("Approve", selectedStudent.name);
            setSelectedStudent(null);
          }}
          onDelete={() => {
            if (!selectedStudent) return;

            setStudents(
              students.filter(
                (student) => student.id !== selectedStudent.id
              )
            );

            setSelectedStudent(null);
          }}
          showDelete={true}
        />
      )}
    </div>
  );
}