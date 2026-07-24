"use client";

import { useState } from "react";

import SearchInput from "@/components/search/SearchInput";
import DataTable from "@/components/table/DataTable";

import StudentDetailsModal from "@/components/modals/StudentDetailsModal";

import {
  studentColumns,
} from "@/lib/data/students";

import type { Student } from "@/lib/types";
type StudentListClientProps = {
  students: Student[];
};

export default function StudentListClient({
  students,
}: StudentListClientProps) {
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [programFilter, setProgramFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [hteFilter, setHteFilter] = useState("All");
  const [search, setSearch] = useState("");

  const programs = [
    "All",
    ...new Set(students.map((s) => s.program)),
  ];

  const sections = [
    "All",
    ...new Set(students.map((s) => s.section)),
  ];

  const htes = [
    "All",
    ...new Set(
      students.map((s) => s.hte?.companyName ?? "No HTE")
    ),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesProgram =
      programFilter === "All" ||
      student.program === programFilter;

    const matchesSection =
      sectionFilter === "All" ||
      student.section === sectionFilter;

    const matchesHTE =
      hteFilter === "All" ||
      (student.hte?.companyName ?? "No HTE") === hteFilter;

    const matchesSearch =
      search === "" ||
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(search.toLowerCase());

    return matchesProgram && matchesSection && matchesHTE && matchesSearch;
  });

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
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
                >
                    {programs.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm text-[#374151]">
                    Section
                </label>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-40 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
                >
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm text-[#374151]">
                    HTE
                </label>

                <select
                  value={hteFilter}
                  onChange={(e) => setHteFilter(e.target.value)}
                  className="w-52 rounded-lg border border-[#D1D5DB] px-3 py-2 text-[#374151]"
                >
                    {htes.map((hte) => (
                      <option key={hte} value={hte}>
                        {hte}
                      </option>
                    ))}
                </select>
            </div>

        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search student number or name..."
        />

        </div>

       <DataTable columns={studentColumns}>
            {filteredStudents.map((student) => (
                <tr
                key={student.id}
                className="cursor-pointer border-t transition-colors hover:bg-[#F3F4F6]"
                onClick={() => {
                    setSelectedStudent(student);
                    }}
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
                    {student.hte?.companyName ?? "No HTE"}
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
