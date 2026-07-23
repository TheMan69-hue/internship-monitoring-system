import type {
  RegistrationStatus,
  Student,
} from "../types";
export const registrationStudents: {
  id: number;
  program: string;
  name: string;
  section: string;
  hte: string;
  status: RegistrationStatus;
}[] = [
  {
    id: 1,
    program: "BSCS",
    name: "Juan Dela Cruz",
    section: "BSCS 3-1",
    hte: "Cavite State University",
    status: "Approved",
  },
  {
    id: 2,
    program: "BSIT",
    name: "Maria Santos",
    section: "BSIT 3-2",
    hte: "Accenture",
    status: "Pending",
  },
  {
    id: 3,
    program: "BSCS",
    name: "John Reyes",
    section: "BSCS 3-1",
    hte: "Department of ICT",
    status: "Pending",
  },
];

export const registrationColumns = [
  {
    key: "program",
    header: "Program",
  },
  {
    key: "name",
    header: "Name",
  },
  {
    key: "section",
    header: "Section",
  },
  {
    key: "hte",
    header: "HTE",
  },
  {
    key: "status",
    header: "Status",
  },
  {
    key: "select",
    header: null,
  },
];

export const studentList: Student[] = [
  {
    id: "1",
    studentNumber: "2023-0001",
    name: "Juan Dela Cruz",
    program: "BSCS",
    section: "BSCS 3-1",
    email: "juan.delacruz@email.com",
    contactNumber: "09123456789",
    hte: {
      id: "hte-1",
      companyName: "Cavite State University",
      address: "Dasmariñas, Cavite",
      contactPerson: "Prof. Maria Santos",
      contactNumber: "09123456789",
      email: "cvsu@email.com",
      status: "Active",
    },
    schedule: {
      expectedTimeIn: "08:00",
      expectedTimeOut: "17:00",
      requiredHours: 240,
      graceMinutes: 15,
    },
  },
  {
    id: "2",
    studentNumber: "2023-0002",
    name: "Maria Santos",
    program: "BSIT",
    section: "BSIT 3-2",
    email: "maria.santos@email.com",
    contactNumber: "09187654321",
    hte: {
      id: "hte-2",
      companyName: "Accenture",
      address: "Makati City",
      contactPerson: "Prof. Carlos Reyes",
      contactNumber: "09187654321",
      email: "accenture@email.com",
      status: "Active",
    },
    schedule: {
      expectedTimeIn: "09:00",
      expectedTimeOut: "18:00",
      requiredHours: 240,
      graceMinutes: 15,
    },
  },
  {
    id: "3",
    studentNumber: "2023-0003",
    name: "John Reyes",
    program: "BSCS",
    section: "BSCS 3-2",
    email: "john.reyes@email.com",
    contactNumber: "09181234567",
    hte: {
      id: "hte-3",
      companyName: "Department of ICT",
      address: "Quezon City",
      contactPerson: "Prof. Angela Cruz",
      contactNumber: "09181234567",
      email: "dict@email.com",
      status: "Completed",
    },
    schedule: {
      expectedTimeIn: "08:30",
      expectedTimeOut: "17:30",
      requiredHours: 240,
      graceMinutes: 15,
    },
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