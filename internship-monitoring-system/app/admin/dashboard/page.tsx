"use client";

import { useState, useEffect } from 'react';
import YearFilter from '@/components/table/YearFilter';
import Card from '@/components/cards/DashboardCard';
import AuditLog, { AuditLogs } from '@/components/cards/AuditLogCard';
import { User, Users, Building2, ClipboardCheck } from 'lucide-react';
import {
  getAdminDashboardStatsAction,
  type AdminDashboardStats,
} from '@/lib/actions/dashboard';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';
import { getAuditLogsAction } from '@/lib/actions/audit-logs';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
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

  // ── Initial Load: Single-pass fetch ──
  // 1. Resolve academic data to find the active semester
  // 2. Make ONE stats call (filtered if active, unfiltered otherwise)
  // No double-fetch, no flash of overall stats before filtering.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: get academic data first to know the active period
        const academicData = await getAcademicPageData();
        setYearOptions(academicData.yearOptions);

        const active = academicData.activeSchoolYear;
        let filters: { year: string; semester: string } | undefined;
        let year = '';
        let semester = '';

        if (active && active.schoolYearId && active.id) {
          year = String(active.schoolYearId);
          semester = String(active.id);
          setSelectedYear(year);
          setSelectedSemester(semester);
          filters = { year, semester };
        }

        // Step 2: single batch of parallel requests
        const [dashboardStats, auditLogs, semesterOpts] = await Promise.all([
          getAdminDashboardStatsAction(filters),
          getAuditLogsAction(),
          year ? getSemestersBySchoolYear(year) : Promise.resolve([]),
        ]);

        setStats(dashboardStats);
        setAuditData(auditLogs);

        if (semesterOpts.length > 0) {
          setSemesterOptions(semesterOpts);
          setSemesterDisabled(false);
        }
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

    // ── Module reset: clear all data before re-fetching ──
    setStats({
      registeredStudents: 0,
      pendingApprovals: 0,
      approvedInterns: 0,
      ojtCoordinators: 0,
      registeredHTE: 0,
      studentSummary: [],
    });
    setAuditData([]);

    try {
      // ── Refresh reference data ──
      const [academicData, semesterOpts] = await Promise.all([
        getAcademicPageData(),
        getSemestersBySchoolYear(year),
      ]);
      setYearOptions(academicData.yearOptions);
      setSemesterOptions(semesterOpts);
      setSemesterDisabled(false);

      // ── Re-fetch main data with filters ──
      const filters = { year, semester };
      const [dashboardStats, auditLogs] = await Promise.all([
        getAdminDashboardStatsAction(filters),
        getAuditLogsAction(),
      ]);
      setStats(dashboardStats);
      setAuditData(auditLogs);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    }
  };

  return (
    <main className=" flex flex-col flex-1 h-full p-5 overflow-auto">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Dashboard</h1>
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

        </div>

      </div>
    </main>
  );
}
