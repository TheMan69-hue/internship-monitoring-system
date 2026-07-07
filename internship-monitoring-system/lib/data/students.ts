import type { Student } from "../types";
export const studentList: Student[] = [
  {
    id: 1,
    studentNumber: "2023-0001",
    name: "Juan Dela Cruz",
    program: "BSCS",
    section: "BSCS 3-1",
    email: "juan.delacruz@email.com",
    contactNumber: "09123456789",
    hte: "Cavite State University",
    workSchedule: "Monday -Friday",
    workingHours: "8:00 AM - 5:00 PM",
    startDate: "August 18, 2026",
    endDate: "December 18, 2026",
    coordinator: "Prof. Maria Santos",
    status: "Active",
  },
  {
    id: 2,
    studentNumber: "2023-0002",
    name: "Maria Santos",
    program: "BSIT",
    section: "BSIT 3-2",
    email: "maria.santos@email.com",
    contactNumber: "09187654321",
    hte: "Accenture",
    workSchedule: "Monday - Friday",
    workingHours: "9:00 AM - 6:00 PM",
    startDate: "August 20, 2026",
    endDate: "December 20, 2026",
    coordinator: "Prof. Carlos Reyes",
    status: "Active",
  },
  {
    id: 3,
    studentNumber: "2023-0003",
    name: "John Reyes",
    program: "BSCS",
    section: "BSCS 3-2",
    email: "john.reyes@email.com",
    contactNumber: "09181234567",
    hte: "Department of ICT",
    workSchedule: "Monday - Thursday",
    workingHours: "8:30 AM - 5:30 PM",
    startDate: "August 25, 2026",
    endDate: "December 22, 2026",
    coordinator: "Prof. Angela Cruz",
    status: "Completed",
  },
];

export const studentColumns = [
  {
    key: "studentNumber",
    header: "Student No.",
  },
  {
    key: "program",
    header: "Program",
  },
  {
    key: "name",
    header: "Student Name",
  },
  {
    key: "section",
    header: "Section",
  },
  {
    key: "hte",
    header: "HTE",
  },
];