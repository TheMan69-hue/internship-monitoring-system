import type { AttendanceLog } from "../types";
export const attendanceColumns = [
  {
    key: "studentNumber",
    header: "Student No.",
  },
  {
    key: "studentName",
    header: "Student Name",
  },
  {
    key: "hte",
    header: "HTE",
  },
  {
    key: "date",
    header: "Date",
  },
  {
    key: "timeIn",
    header: "Time In",
  },
  {
    key: "timeOut",
    header: "Time Out",
  },

];
export const attendanceLogs: AttendanceLog[] = [
  {
    id: 1,
    studentNumber: "2023-0001",
    studentName: "Juan Dela Cruz",
    program: "BSCS",
    section: "BSCS 3-1",
    hte: "Cavite State University",

    date: "September 12, 2026",

    timeIn: "7:58 AM",
    timeOut: "5:02 PM",

    location: "College of Information Technology",

    remarks: "On Time",
  },

  {
    id: 2,
    studentNumber: "2023-0002",
    studentName: "Maria Santos",
    program: "BSIT",
    section: "BSIT 3-2",
    hte: "Accenture",

    date: "September 12, 2026",

    timeIn: "8:12 AM",
    timeOut: "5:05 PM",

    location: "Accenture Building",

    remarks: "Late",
  },

  {
    id: 3,
    studentNumber: "2023-0003",
    studentName: "John Reyes",
    program: "BSCS",
    section: "BSCS 3-2",
    hte: "Department of ICT",

    date: "September 12, 2026",

    timeIn: "7:55 AM",
    timeOut: "5:00 PM",

    location: "Department of ICT",

    remarks: "On Time",
  },
];