export type RegistrationStatus =
  | "Approved"
  | "Pending";

export type InternshipStatus =
  | "Active"
  | "Completed";

export interface Student {
  id: number;
  studentNumber: string;
  name: string;
  program: string;
  section: string;
  email: string;
  contactNumber: string;
  hte: string;
  workSchedule: string;
  workingHours: string;
  startDate: string;
  endDate: string;
  coordinator: string;
  status: InternshipStatus;
}

export interface HTE {
  id: number;
  company: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  workSchedule: string;
  workingHours: string;
  currentInterns: number;
}

export interface AttendanceLog {
  id: number;
  studentNumber: string;
  studentName: string;
  program: string;
  section: string;
  hte: string;
  date: string;
  timeIn: string;
  timeOut: string;
  location: string;
  remarks: string;
}