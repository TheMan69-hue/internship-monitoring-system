import { getAllStudentsServer } from '@/lib/services/admin/students-server';
import InternClient from './InternClient';

export default async function InternPage() {
  let initialStudents: Awaited<ReturnType<typeof getAllStudentsServer>> = [];

  try {
    initialStudents = await getAllStudentsServer();
  } catch (error) {
    console.error('Error fetching students:', error);
  }

  return <InternClient initialStudents={initialStudents} />;
}
