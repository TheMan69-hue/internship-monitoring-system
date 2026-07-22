export type RegistrationStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export type InternshipStatus =
  | "Active"
  | "Completed";

export interface StudentRegistration {
  id: string;
  studentNumber: string;
  name: string;
  program: string;
  section: string;
  email: string;
  contactNumber: string;
  hte: string;
  status: RegistrationStatus;
}

export interface Student {
  id: string;
  studentNumber: string;
  name: string;
  program: string;
  section: string;
  email: string;
  contactNumber: string;

  hte: {
    id: string;
    companyName: string;
    address: string | null;
    contactPerson: string | null;
    contactNumber: string | null;
    email: string | null;
    status: string;
  } | null;

  schedule: {
    expectedTimeIn: string;
    expectedTimeOut: string;
    requiredHours: number;
    graceMinutes: number;
  } | null;
}

export interface HTE {
  id: string;
  company: string;
  address: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  workSchedule: string | null;
  workingHours: string | null;
  currentInterns: number;
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  program: string;
  section: string;
  hte: string;
  rawDate: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  location: string | null;
  status: string;
  gpsCoordinates: string | null;
}

export interface AttendanceGroup {
  studentId: string;
  studentNumber: string;
  studentName: string;
  program: string;
  section: string;
  hte: string;

  latestAttendance: AttendanceLog;
  attendanceHistory: AttendanceLog[];
}

export interface Program {
  id: string;
  programName: string;
}

export interface Section {
  id: string;
  sectionName: string;
}
export interface CoordinatorAssignment {
  id: string;
  coordinatorId: string;
  programId: string;
  sectionId: string;
}