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
import { getAcademicPageData } from '@/lib/services/admin/academic';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditLogs[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats>({
    registeredStudents: 0,
    pendingApprovals: 0,
    approvedInterns: 0,
    ojtCoordinators: 0,
    registeredHTE: 0,
    studentSummary: [],
  });

  const [yearOptions, setYearOptions] = useState<{ value: string; label: string }[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
        setSemesterOptions(academicData.semesterOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className=" flex flex-col flex-1 h-full p-5 overflow-auto">
      <div className='flex flex-row justify-between items-center text-black'>
        <h1>Dashboard</h1>
        <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
      </div>
      <div>
        <YearFilter
          yearLabel="Academic Year"
          yearOptions={yearOptions}
          yearValue={selectedYear}
          onYearChange={setSelectedYear}
          semesterLabel="Semester"
          semesterOptions={semesterOptions}
          semesterValue={selectedSemester}
          onSemesterChange={setSelectedSemester}
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
              isLoading={isLoading}
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
