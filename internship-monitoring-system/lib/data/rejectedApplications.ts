import type { RegistrationStudent } from "./registration";

export const rejectedApplications: RegistrationStudent[] = [
  {
    id: 1,
    studentNumber: "2023-0010",
    name: "Pedro Santos",

    program: "BSCS",
    section: "BSCS 3-2",

    email: "pedro@email.com",
    contactNumber: "09123456789",

    hte: "Accenture",

    status: "Rejected",
  },

  {
    id: 2,
    studentNumber: "2023-0011",
    name: "Ana Cruz",

    program: "BSIT",
    section: "BSIT 3-1",

    email: "ana@email.com",
    contactNumber: "09999999999",

    hte: "Department of ICT",

    status: "Rejected",
  },
];

export const rejectedApplicationColumns = [
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