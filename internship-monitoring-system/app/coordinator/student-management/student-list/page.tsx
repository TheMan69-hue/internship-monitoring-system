"use client";

import { useState } from "react";

import SearchBar from "@/components/search/SearchBar";
import DataTable from "@/components/table/DataTable";

import StudentDetailsModal from "@/components/modals/StudentDetailsModal";

import {
    studentColumns,
    studentList,
} from "@/lib/student";

import type { Student } from "@/lib/types";
export default function StudentListPage() {
    const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-3xl font-semibold text-[#111827]">
        Student List
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

            <div>
                <label className="mb-1 block text-sm text-[#374151]">
                    HTE
                </label>

                <select className="w-52 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]">
                    <option>All</option>
                </select>
            </div>

        </div>

        <SearchBar />

        </div>

       <DataTable columns={studentColumns}>
            {studentList.map((student) => (
                <tr
                key={student.id}
                className="cursor-pointer border-t transition-colors hover:bg-[#F3F4F6]"
                onClick={() => setSelectedStudent(student)}
                >
                <td className="px-6 py-4 text-[#374151]">
                    {student.studentNumber}
                </td>
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
                </tr>
            ))}
        </DataTable>
        {selectedStudent && (
            <StudentDetailsModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
            />
        )}

    </div>
    );
}