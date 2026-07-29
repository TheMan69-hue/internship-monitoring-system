"use client";

import { useState, useEffect } from 'react';
import { getAcademicPageData } from '@/lib/services/admin/academic';

function formatSemester(semester: string | undefined): string {
  switch (semester) {
    case '1st':
      return '1st Semester';
    case '2nd':
      return '2nd Semester';
    case 'midyear':
      return 'Midyear';
    default:
      return 'No Active Semester';
  }
}

export default function ActiveSchoolYear() {
  const [label, setLabel] = useState('No Active Academic Year');

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const academicData = await getAcademicPageData();
        if (cancelled) return;
        const active = academicData.activeSchoolYear;
        if (active?.academicYear) {
          setLabel(`${active.academicYear} — ${formatSemester(active.semester)}`);
        } else {
          setLabel('No Active Academic Year');
        }
      } catch {
        // silently fail — keep default label
      }
    };

    fetchData();

    const handler = () => fetchData();
    window.addEventListener('academic-data-changed', handler);
    return () => {
      cancelled = true;
      window.removeEventListener('academic-data-changed', handler);
    };
  }, []);

  return (
    <h1 className="text-sm font-bold text-gray-700">{label}</h1>
  );
}
