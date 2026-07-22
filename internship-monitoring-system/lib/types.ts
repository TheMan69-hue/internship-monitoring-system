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
  id: number;
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

export type Coordinator = {
  id: number;
  name: string;
  email: string;
  contact_num: string;
  role: 'admin' | 'coordinator' | 'student';
  password: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
}

export type Section = {
  id: number;
  program_id: string;
  school_year: string;
  name: string;
  coordinator_id: number;
  created_at: string;
}

export type SchoolYear = {
  id: number;
  academicYear: string;
  semester: '1st' | '2nd' | 'summer';
  is_active: boolean;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

export type Program = {
  id: number;
  name: string;
  required_hours: number;
  Total_Interns?: number;
  Total_Coordinator?: number
}