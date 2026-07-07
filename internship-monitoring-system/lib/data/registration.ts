import type { RegistrationStatus } from "../types";

export type RegistrationStudent = {
  id: number;
  studentNumber: string;
  program: string;
  name: string;
  section: string;
  email: string;
  contactNumber: string;
  hte: string;
  status: RegistrationStatus;
};

export const registrationStudents: RegistrationStudent[] = [
  {
    id: 1,
    studentNumber: "2023-0001",
    name: "Juan Dela Cruz",

    program: "BSCS",
    section: "BSCS 3-1",

    email: "juan@email.com",
    contactNumber: "09123456789",

    hte: "Cavite State University",

    status: "Pending",
  },
  {
    id: 2,
    program: "BSIT",
    name: "Maria Santos",
    section: "BSIT 3-2",
    hte: "Accenture",
    status: "Pending",
    studentNumber: "",
    email: "",
    contactNumber: ""
  },
  {
    id: 3,
    program: "BSCS",
    name: "John Reyes",
    section: "BSCS 3-1",
    hte: "Department of ICT",
    status: "Pending",
    studentNumber: "",
    email: "",
    contactNumber: ""
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