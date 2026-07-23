'use client';

import { useState } from 'react';
import Modal from '@/components/modals/Modal';
import Button from '@/components/buttons/buttons';
import Dropdown from '@/components/buttons/dropdown';
import { SchoolYear } from '@/lib/types';

interface AddNewSchoolYearProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<SchoolYear, 'id'> & { id?: number }) => void;
  activeSchoolYear?: SchoolYear | null;
  existingRecords?: SchoolYear[];
  editData?: SchoolYear | null;
}

export default function AddNewSchoolYear({
  show,
  onClose,
  onSubmit,
  activeSchoolYear,
  existingRecords = [],
  editData,
}: AddNewSchoolYearProps) {
  const [selectedSemester, setSelectedSemester] = useState<'1st' | '2nd' | 'summer' | ''>(editData?.semester || "");
  const [schoolYearStart, setSchoolYearStart] = useState(editData?.academicYear.split("-")[0] || "");
  const [schoolYearEnd, setSchoolYearEnd] = useState(editData?.academicYear.split("-")[1] || "");
  const [semesterStart, setSemesterStart] = useState(editData?.startDate || "");
  const [semesterEnd, setSemesterEnd] = useState(editData?.endDate || "");
  const [Error, setError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [semesterError, setSemesterError] = useState("");
  
  if (!show) return null;

  const handleSubmit = () => {
    // 0. Check semester selection
    if (!selectedSemester) {
      setSemesterError("Please select a semester.");
      return;
    }

    // 1. Check all fields are filled
    if (!semesterStart) {
      setStartDateError("Start date is required.");
      return;
    }
    if (!semesterEnd) {
      setEndDateError("End date is required.");
      return;
    }

    const startYear = parseInt(schoolYearStart, 10);
    const endYear = parseInt(schoolYearEnd, 10);

    // 1. Validate semester constraints
    if (selectedSemester === "1st") {
      // 1st semester: no restriction on year
    } else {
      // 2nd/Summer: must be within active school year
      if (!activeSchoolYear) {
        setError("No active school year. Please set one first before adding 2nd semester or summer.");
        return;
      }
      const [activeStart, activeEnd] = activeSchoolYear.academicYear.split("-").map(Number);
      if (startYear !== activeStart || endYear !== activeEnd) {
        setError(`2nd semester and summer must be within the active school year (${activeSchoolYear.academicYear}).`);
        return;
      }
    }

    // 2. Check for duplicate academic year + semester
    const academicYear = `${schoolYearStart}-${schoolYearEnd}`;
    const duplicate = existingRecords.find(
      (r) => r.academicYear === academicYear && r.semester === selectedSemester
    );
    if (duplicate) {
      setError(`A record for ${academicYear} ${selectedSemester} semester already exists.`);
      return;
    }

    // ✅ Passed validation
    const newRecord = {
      ...(editData && { id: editData.id }),
      academicYear: `${schoolYearStart}-${schoolYearEnd}`,
      semester: selectedSemester,
      is_active: editData?.is_active ?? false,
      status: editData?.status ?? "inactive",
      startDate: semesterStart,
      endDate: semesterEnd,
    };

    onSubmit(newRecord);
    console.log("New SchoolYear record:", newRecord);
    onClose();
  };

  return (
    <Modal
        title={editData ? "Edit Record" : "New Record"}
        onClose={onClose} // close modal when X or overlay clicked
    >
        <div className="flex flex-col text-black gap-5">
          {Error && <p className="text-red-500 text-xs">{Error}</p>}
          <Dropdown
              label="Choose Semester"
              value={selectedSemester}
              options={[
                { value: "1st", label: "1st Semester" },
                { value: "2nd", label: "2nd Semester" },
                { value: "summer", label: "Summer" },
              ]}
              onSelect={(value) => {
                setSelectedSemester(value);
                setSemesterError("");
                setError("");
              }}
          />
          {semesterError && <p className="text-red-500 text-xs mt-1">{semesterError}</p>}

          <p>Semester Timeline:</p>

          <div className="flex items-center gap-10">
              <p>Start Date:</p>
              <input
                className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={semesterStart}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selectedDate < today) {
                    setStartDateError("Start date cannot be set to yesterday or earlier.");
                    return;
                  }
                  setStartDateError("");
                  setError("");
                  setSemesterStart(e.target.value);
                  const year = selectedDate.getFullYear();
                  
                  if (selectedSemester === "1st") {
                    // 1st semester: any year allowed, +1 end if same year
                    setSchoolYearStart(year.toString());
                    setSchoolYearEnd(year.toString());
                  } else {
                    // 2nd/Summer: must be within active school year
                    if (activeSchoolYear) {
                      const [activeStart, activeEnd] = activeSchoolYear.academicYear.split("-").map(Number);
                      // Validate start date is within active school year (Sep to Aug)
                      const activeStartMonth = 9; // September
                      const activeStartDate = new Date(activeStart, activeStartMonth - 1, 1);
                      const activeEndDate = new Date(activeEnd, 7, 31); // August 31
                      if (selectedDate < activeStartDate || selectedDate > activeEndDate) {
                        setStartDateError(`Start date must be within the active school year (${activeSchoolYear.academicYear}).`);
                        return;
                      }
                      setSchoolYearStart(activeStart.toString());
                      setSchoolYearEnd(activeEnd.toString());
                    } else {
                      setStartDateError("No active school year. Please set one first.");
                      return;
                    }
                  }
                }}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                />
              {startDateError && <p className="text-red-500 text-xs mt-1">{startDateError}</p>}
          </div>

          <div className="flex items-center gap-11">
              <p>End Date:</p>
              <input
                className={`p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!semesterStart ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={semesterEnd}
                onChange={(e) => {
                  if (!semesterStart) {
                    setEndDateError("Please select a start date first.");
                    return;
                  }
                  const duration = selectedSemester === "summer" ? 2 : 5;
                  const startDate = new Date(semesterStart);
                  const minEndMonth = new Date(startDate);
                  minEndMonth.setMonth(minEndMonth.getMonth() + duration);
                  const minEnd = new Date(minEndMonth.getFullYear(), minEndMonth.getMonth(), 1);
                  const selectedDate = new Date(e.target.value);
                  if (selectedDate < minEnd) {
                    setEndDateError(`End date must be in or after ${minEnd.toLocaleString('default', { month: 'long' })} ${minEnd.getFullYear()} (${duration} months from start).`);
                    return;
                  }
                  setEndDateError("");
                  setError("");
                  setSemesterEnd(e.target.value);
                  
                  if (selectedSemester === "1st") {
                    const startYear = parseInt(schoolYearStart, 10);
                    const endYearNum = selectedDate.getFullYear();
                    if (endYearNum === startYear) {
                      setSchoolYearEnd((endYearNum + 1).toString());
                    } else {
                      setSchoolYearEnd(endYearNum.toString());
                    }
                  } else {
                    // 2nd/Summer: validate end date stays within active school year
                    if (activeSchoolYear) {
                      const [activeStart, activeEnd] = activeSchoolYear.academicYear.split("-").map(Number)
                      const activeEndDate = new Date(activeEnd, 7, 31); // August 31
                      if (selectedDate > activeEndDate) {
                        setEndDateError(`End date must be within the active school year (${activeSchoolYear.academicYear}).`);
                        return;
                      }
                      setSchoolYearEnd(activeEnd.toString());
                    }
                  }
                }}
                type="date"
                min={(() => {
                  if (!semesterStart || !selectedSemester) return undefined;
                  const duration = selectedSemester === "summer" ? 2 : 5;
                  const d = new Date(semesterStart);
                  d.setMonth(d.getMonth() + duration);
                  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                })()}
                disabled={!semesterStart}
              />
              {endDateError && <p className="text-red-500 text-xs mt-1">{endDateError}</p>}
          </div>

          <div className="flex justify-center gap-5 mt-5">
              <Button
                onClick={handleSubmit}
                type="submit"
                variant="primary"
                size="sm"
              >
              Add
              </Button>

              <Button
                onClick={onClose}
                type="button"
                variant="secondary"
                size="sm"
              >
              Cancel
              </Button>
          </div>
        </div>
    </Modal>
  );
}
