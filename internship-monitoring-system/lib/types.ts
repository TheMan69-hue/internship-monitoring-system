export type HTE = {
  id: number;
  company: string;
  address: string;
  interns: number;
  contactPerson: string;
  email: string;
  phone: string;
  schedule: string;
  hours: string;
};
  export type Intern = {
  id: string;
  name: string;
  email: string;
  course: string;
  academicYear: string;
  semester: '1st' | '2nd' | 'summer';
  status: 'active' | 'inactive' | 'completed' | 'pending';
  section: string;
  hte?: string;
  startDate?: string;
  endDate?: string;
}