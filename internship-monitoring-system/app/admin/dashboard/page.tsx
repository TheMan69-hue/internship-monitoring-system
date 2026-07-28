"use client";

import { useState, useEffect } from 'react';
import YearFilter from '@/components/table/YearFilter';
import Card from '@/components/cards/DashboardCard';
import Summary from '@/components/cards/DashboardSummaryCard';
import AuditLog, { AuditLogs } from '@/components/cards/AuditLogCard';
import { User, Users, Building2, ClipboardCheck } from 'lucide-react';
import {
  getAdminDashboardStats,
  getAuditLogs,
  type AdminDashboardStats,
  type AuditLogEntry,
} from '@/lib/services/admin/dashboard';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [auditData, setAuditData] = useState<AuditLogs[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats>({
    registeredStudents: 0,
    pendingApprovals: 0,
    approvedInterns: 0,
    ojtCoordinators: 0,
    registeredHTE: 0,
    studentSummary: [],
  });

  // ── Academic Year / Semester Filter State ──
  // yearOptions:    All school years from DB, populates the year dropdown
  // semesterOptions: Semesters for the currently selected year, populates the semester dropdown
  // semesterDisabled: True until the user selects a year (semester dropdown is greyed out)
  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load: Fetch all data needed for the dashboard ──
  // Runs once on component mount. Gets dashboard stats, audit logs,
  // and academic year options for the filter dropdown.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, auditLogs, academicData] = await Promise.all([
          getAdminDashboardStats(),
          getAuditLogs(),
          getAcademicPageData(),
        ]);

        setStats(dashboardStats);
        setAuditData(
          auditLogs.map((log: AuditLogEntry) => ({
            ...log,
            status: log.status ?? '',
          }))
        );
        setCurrentActiveYear(academicData.activeSchoolYear?.academicYear ?? '');
        setYearOptions(academicData.yearOptions);
        // Note: semesterOptions is NOT set here — it will be fetched
        // when the user selects a year via handleYearChange
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // ── Year Change Handler ──
  // Triggered when the user picks a year in the YearFilter dropdown.
  // Fetches semesters for that year and enables the semester dropdown.
  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    setSelectedSemester('');           // Reset semester when year changes
    setSemesterDisabled(true);         // Disable semester dropdown until semesters load
    if (year) {
      try {
        const semesters = await getSemestersBySchoolYear(year);
        setSemesterOptions(semesters);
        setSemesterDisabled(false);    // Enable semester dropdown now that options are loaded
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setSemesterOptions([]);
      }
    } else {
      setSemesterOptions([]);
    }
  };

  // ── Load Button Handler ──
  // Triggered when the user clicks "Load Academic Year" in the YearFilter.
  // Passes selected year and semester as filters to Supabase queries.
  const handleLoad = async (year: string, semester: string) => {
    if (!year || !semester) return;
    try {
      const filters = { year, semester };
      const [dashboardStats, auditLogs] = await Promise.all([
        getAdminDashboardStats(filters),
        getAuditLogs(),
      ]);
      setStats(dashboardStats);
      setAuditData(
        auditLogs.map((log: AuditLogEntry) => ({
          ...log,
          status: log.status ?? '',
        }))
      );
    } catch (error) {
      console.error('Error loading filtered data:', error);
    }
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5 overflow-auto">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Dashboard</h1>
        <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
      </div>
      <div>
        {/* ── Academic Year / Semester Filter ──
            Year dropdown is populated on load.
            Semester dropdown is populated when a year is selected.
            Button triggers filtering with the chosen combination.     */}
        <YearFilter
          yearLabel="Academic Year"
          yearOptions={yearOptions}
          yearValue={selectedYear}
          onYearChange={handleYearChange}
          semesterLabel="Semester"
          semesterOptions={semesterOptions}
          semesterValue={selectedSemester}
          onSemesterChange={setSelectedSemester}
          onLoad={handleLoad}
          semesterDisabled={semesterDisabled}
        />
      </div>
      <div className=' rounded-lg w-full h-full'>
        <div className='grid grid-flow-row-dense grid-cols-4 auto-rows-auto gap-5'>
          <div>
            <Card
              title='Registered Students'
              value={stats.registeredStudents}
              icon={Users} />
          </div>
          <div>
            <Card
              title='Pending Approvals'
              value={stats.pendingApprovals}
              icon={ClipboardCheck} />
          </div>
          <div>
            <Card
              title='Approved Interns'
              value={stats.approvedInterns}
              icon={User} />
          </div>
          <div>
            <Card
              title='OJT Coordinators'
              value={stats.ojtCoordinators}
              icon={User} />
          </div>
          <div className='col-span-3 row-span-2 grid-rows-subgrid'>
            <AuditLog
              title='Audit Logs'
              data={auditData}
            />
          </div>
          <div>
            <Card
              title='Registered HTE'
              value={stats.registeredHTE}
              icon={Building2} />
          </div>
          <div>
            <Summary title='Student Summary' data={stats.studentSummary} />
          </div>
        </div>

      </div>
    </main>
  );
}
