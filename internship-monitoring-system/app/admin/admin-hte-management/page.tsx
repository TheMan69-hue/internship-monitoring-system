"use client";

import { useState, useEffect } from 'react';
import { HTE } from '@/lib/types';
import YearFilter from '@/components/table/YearFilter';
import TableLayout from '@/components/layout/TablePageLayout';
import ReusableTable from '@/components/table/Table';
import HTEDetailsModal from '@/components/modals/HTEDetailsModal';
import HTEFormModal from '@/components/modals/HTEFormModal';
import { fetchHTECompanies } from '@/lib/actions/hte';
import { getAcademicPageData, getSemestersBySchoolYear } from '@/lib/services/admin/academic';

type AcademicOption = { value: string; label: string };

export default function HTEManagementPage() {
  const [Data, setData] = useState<HTE[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHTE, setSelectedHTE] = useState<HTE | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');

  // ── Academic Year / Semester Filter State ──
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [yearOptions, setYearOptions] = useState<AcademicOption[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<AcademicOption[]>([]);
  const [semesterDisabled, setSemesterDisabled] = useState(true);

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [htes, academicData] = await Promise.all([
          fetchHTECompanies(),
          getAcademicPageData(),
        ]);
        setData(htes);
        setYearOptions(academicData.yearOptions);

        // Auto-select active school year and semester
        const active = academicData.activeSchoolYear;
        if (active && active.schoolYearId && active.id) {
          setSelectedYear(String(active.schoolYearId));
          setSelectedSemester(String(active.id));

          const semesters = await getSemestersBySchoolYear(String(active.schoolYearId));
          setSemesterOptions(semesters);
          setSemesterDisabled(false);

          // Re-fetch HTEs filtered by active semester
          const filteredHTEs = await fetchHTECompanies({
            year: String(active.schoolYearId),
            semester: String(active.id),
          });
          setData(filteredHTEs);
        }
      } catch (error) {
        console.error('Error fetching HTE data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    setSelectedSemester('');
    setSemesterDisabled(true);
    if (year) {
      try {
        const semesters = await getSemestersBySchoolYear(year);
        setSemesterOptions(semesters);
        setSemesterDisabled(false);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setSemesterOptions([]);
      }
    } else {
      setSemesterOptions([]);
    }
  };

  const handleLoad = async (year: string, semester: string) => {
    if (!year || !semester) return;
    setIsLoading(true);
    try {
      const filters = { year, semester };
      const htes = await fetchHTECompanies(filters);
      setData(htes);
    } catch (error) {
      console.error('Error loading filtered data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (hte: HTE) => {
    setSelectedHTE(hte);
    setShowDetailsModal(true);
  };

  const handleEdit = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleRefresh = async () => {
    try {
      const htes = await fetchHTECompanies();
      setData(htes);
    } catch (error) {
      console.error('Error refreshing HTE data:', error);
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full p-5">
      <div className="flex flex-row justify-between items-center text-black mb-5">
        <h1>HTE Management</h1>
      </div>
      <div>
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
      <TableLayout<HTE> title="HTE Companies" data={Data} searchKeys={['company', 'address', 'contactPerson', 'email']}>
        {(pagedData) => (
          <ReusableTable
            data={pagedData}
            isLoading={isLoading}
            columns={['company', 'address', 'contactPerson', 'email', 'currentInterns']}
            onRowClick={handleRowClick}
          />
        )}
      </TableLayout>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 font-bold">&times;</button>
        </div>
      )}

      {showDetailsModal && selectedHTE && (
        <HTEDetailsModal
          hte={selectedHTE}
          hteId={selectedHTE.id}
          onClose={() => { setShowDetailsModal(false); setSelectedHTE(null); }}
          onEdit={handleEdit}
          onSuccess={() => {
            setShowDetailsModal(false);
            setSelectedHTE(null);
            handleRefresh();
          }}
          onError={(msg) => setError(msg)}
        />
      )}

      {showEditModal && selectedHTE && (
        <HTEFormModal
          hte={selectedHTE}
          hteId={selectedHTE.id}
          onClose={() => { setShowEditModal(false); setSelectedHTE(null); }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedHTE(null);
            handleRefresh();
          }}
          onError={(msg) => setError(msg)}
        />
      )}
    </main>
  );
}
