import StudentListClient from "./StudentListClient";

import { getAssignedStudents } from "@/lib/services/coordinator/students";

export default async function StudentListPage() {

  const students = await getAssignedStudents();

  return (
    <StudentListClient
      students={students}
    />
  );
}