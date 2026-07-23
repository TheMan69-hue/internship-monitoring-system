"use client";

import { useState, useEffect } from 'react';
import YearFilter from '@/components/table/YearFilter';
import Card from '@/components/cards/DashboardCard';
import Summary from '@/components/cards/DashboardSummaryCard';
import AuditLog, { AuditLogs } from '@/components/cards/AuditLogCard'
import { auditLogs as mockAuditLogs } from '@/lib/auditlogs';
import { User } from "lucide-react";


export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [Auditlog, setAuditlog] = useState<AuditLogs[]>([]);

  const yearOptions = [
    { value: '2024', label: '2024-2025' },
    { value: '2025', label: '2025-2026' },
    { value: '2026', label: '2026-2027' },
  ];

  const semesterOptions = [
    { value: '1st', label: '1st Semester' },
    { value: '2nd', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' },
  ];

  useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // TODO: Replace with actual API calls to database
          setCurrentActiveYear('2024');
          setAuditlog(mockAuditLogs);
          // setSchoolYears(await fetchSchoolYearsFromDB());
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
              <div >
                <Card 
                title='Registered Students'
                value={67}
                icon={User}/>
              </div>
              <div>
                <Card 
                title='Pending Approvals'
                value={67}
                icon={User}/>
              </div>
              <div>
                <Card 
                title='Approved Interns'
                value={67}
                icon={User}/>
              </div>
              <div>
                <Card 
                title='OJT Coordinators'
                value={67}
                icon={User}/>
              </div>
              <div className='col-span-3 row-span-2 grid-rows-subgrid'>
                <AuditLog
                  title='Audit Logs'
                  data={mockAuditLogs}
                  isLoading={isLoading}
                />
              </div>
              <div>
                <Card 
                title='Registered HTE'
                value={67}
                icon={User}/>
              </div>
              <div>
                <Summary title='Student Summary'/>
              </div>
            </div>
            
          </div>
      </main>
  );
}