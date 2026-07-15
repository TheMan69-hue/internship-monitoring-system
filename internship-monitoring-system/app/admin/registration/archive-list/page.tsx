"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import YearFilter from '@/components/table/YearFilter';
import SchoolYearLists, { type SchoolYear } from '@/components/table/SchoolYear';
import { mockSchoolYearLists } from '@/lib/schoolyear';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import Dropdown from '@/components/buttons/dropdown';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [currentActiveYear, setCurrentActiveYear] = useState<string>('');
  const [SchoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  //TODO: Replace school_year data here from database
  const yearOptions = [
    { value: '2024', label: '2024-2025' },
    { value: '2025', label: '2025-2026' },
    { value: '2026', label: '2026-2027' },
  ];

    //TODO: Replace semesters data from database here 
  const semesterOptions = [
    { value: '1st', label: '1st Semester' },
    { value: '2nd', label: '2nd Semester' },
    { value: 'summer', label: 'Summer' },
  ];

  // Fetch current active year and SchoolYears from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls to database
        setCurrentActiveYear('2024');
        setSchoolYears(mockSchoolYearLists);
        // setSchoolYears(await fetchSchoolYearsFromDB());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new entry TODO: modal for add
  // const handleAdd = (newSchoolYear) => {
  //   setSchoolYears((prev) => {
  //     const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
  //     return [...prev, { ...newSchoolYear, id: newId }];
  //   });
  // };
  
  // Update entry TODO: modal for edit
  // const handleUpdate = (id: number, updated: Partial<SchoolYear>) => {
  //   SchoolYears.map((y) => (y.id === id ? {...y, ...updated} : y))
  // }; 

  return (
    //TODO: change route page
    <div>
        <main className=" flex flex-col flex-1 h-full p-5">
            <div className='flex flex-row justify-between items-center text-black'>
              <h1>Archive List</h1>
              <h1>{yearOptions.find(opt => opt.value === currentActiveYear)?.label || 'No Active Academic Year'}</h1>
            </div>
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
            <SchoolYearLists data={SchoolYears} isLoading={isLoading} onRowClick={(SchoolYear) => router.push(`/SchoolYears/${SchoolYear.id}`)}/>
            <div>
              <Button 
              onClick={() => setShowModal(true)}
              type="submit"
              variant="primary"
              size="sm"
              >Add New Record</Button>
            </div>
            {showModal && (
              <Modal
              title='New Record'
              onClose={() => setShowModal(false)}
              >
                <div className='flex flex-col text-black gap-5 items-between'>
                  <p>School Year Timeline:</p>  
                  <div className='flex text-black items-center gap-10'>
                    <p>Start Date:</p>
                    <input 
                      className="flex p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="string" />
                  </div>
                  <div className='flex text-black items-center gap-11'>
                    <p>End Date:</p>
                    <input 
                      className="flex p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="string" />
                  </div>
                  <Dropdown
                  label="Choose Semester"
                  options={['1st Semester', '2nd Semester', 'Summer']}
                  onSelect={setSelectedSemester}
                  />
                  <p>Semester Timeline:</p>  
                  <div className='flex text-black items-center gap-10'>
                    <p>Start Date:</p>
                    <input 
                      className="flex p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="Date" />
                  </div>
                  <div className='flex text-black items-center gap-11'>
                    <p>End Date:</p>
                    <input 
                      className="flex p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="Date" />
                  </div>
                  <div className='flex justify-center gap-5 mt-5'>
                    <Button 
                    onClick={() => setShowModal(true)}
                    type="submit"
                    variant="primary"
                    size="sm"
                    >Add</Button>
                    <Button 
                    onClick={() => setShowModal(false)}
                    type="submit"
                    variant="secondary"
                    size="sm"
                    >Cancel</Button>
                  </div>
                </div>
              </Modal>
            )}
        </main>
    </div>
  );
}