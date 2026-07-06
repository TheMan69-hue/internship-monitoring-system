"use client";
import { useState } from "react";
import { registrationColumns, registrationStudents } from "@/lib/student";
import SearchBar from "@/components/search/SearchBar";
import DataTable from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";

export default function RegistrationListPage() {
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const allSelected =
        selectedStudents.length === registrationStudents.length;
        const handleSelectAll = () => {
        if (allSelected) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(
            registrationStudents.map((student) => student.id)
                );
            }
        };
        const handleSelectStudent = (id: number) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(
            selectedStudents.filter((studentId) => studentId !== id)
            );
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
        };
        const columns = registrationColumns.map((column) =>
        column.key === "select"
            ? {
                ...column,
                header: (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-[#D1D5DB]"
                />
                ),
            }
            : column
        );
        
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">

      {/* Title */}
      <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Registration List
      </h2>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">

        <div className="flex gap-4">

          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Program
            </label>

            <select className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]">
              <option>All</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#374151]">
              Section
            </label>

            <select className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]">
              <option>All</option>
            </select>
          </div>

        </div>

        <SearchBar />
      </div>

      {/* Table */}
      <DataTable columns={columns}>

        {registrationStudents.map((student) => (

          <tr
            key={student.id}
            className="cursor-pointer border-t transition-colors hover:bg-[#F3F4F6]"
          >

            <td className="px-6 py-4 text-[#374151]">
              {student.program}
            </td>

            <td className="px-6 py-4 text-[#374151]">
              {student.name}
            </td>

            <td className="px-6 py-4 text-[#374151]">
              {student.section}
            </td>

            <td className="px-6 py-4 text-[#374151]">
              {student.hte}
            </td>

            <td className="px-6 py-4">
              <StatusBadge status={student.status} />
            </td>

            <td className="px-6 py-4 text-center">
              <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="h-4 w-4 rounded border-[#D1D5DB]"
              />
            </td>

          </tr>

        ))}

      </DataTable>

     {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[#374151]">
                Showing 1 to 8 of 520 entries
            </p>
            <div className="flex items-center gap-2">
                <button className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]">
                Prev
                </button>
                <button className="rounded border border-[#D1D5DB] bg-white px-3 py-1 text-[#374151] hover:bg-[#F3F4F6]">
                Next
                </button>
            </div>
            <div className="flex gap-3">
                <button className="rounded-lg bg-[#16A34A] px-5 py-2 text-white hover:bg-[#15803D]">
                Accept
                </button>
                <button className="rounded-lg bg-[#DC2626] px-5 py-2 text-white hover:bg-[#B91C1C]">
                Cancel
                </button>
            </div>
        </div>

    </div>
  );
}