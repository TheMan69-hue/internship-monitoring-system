"use client";

import { useState, useCallback, useEffect } from "react";
import Modal from "@/components/modals/Modal";
import Button from "@/components/buttons/buttons";
import Dropdown from "@/components/buttons/dropdown";
import { createSemester, updateSemester } from "@/lib/actions/academic";
import { createClient } from "@/lib/supabase/client";

interface SemesterRow {
  id: string;
  name: string;
  is_active: boolean;
  status: "active" | "inactive";
  start_date: string | null;
  end_date: string | null;
}

interface AddNewSemesterProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  yearOptions: { value: string; label: string }[];
  editData: SemesterRow | null;
  schoolYearId: string;
}

export default function AddNewSemester({
  show,
  onClose,
  onSuccess,
  yearOptions,
  editData,
  schoolYearId,
}: AddNewSemesterProps) {
  const [schoolYearIdState, setSchoolYearIdState] = useState("");
  const [semesterName, setSemesterName] = useState<"1st" | "2nd" | "midyear" | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [semesterError, setSemesterError] = useState("");
  const [existingNames, setExistingNames] = useState<string[]>([]);

  // Fetch existing semester names for the selected school year
  const fetchExistingSemesters = useCallback(async (yearId: string) => {
    if (!yearId) {
      setExistingNames([]);
      return;
    }
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("semesters")
        .select("name")
        .eq("school_year_id", yearId);
      setExistingNames((data ?? []).map((s) => s.name ?? "").filter(Boolean));
    } catch {
      setExistingNames([]);
    }
  }, []);

  // Initialize form when editData changes
  useEffect(() => {
    const initForm = () => {
      if (editData) {
        setSchoolYearIdState(schoolYearId);
        setSemesterName(editData.name as "1st" | "2nd" | "midyear");
        setStartDate(editData.start_date ?? "");
        setEndDate(editData.end_date ?? "");
        fetchExistingSemesters(schoolYearId);
      } else {
        setSchoolYearIdState("");
        setSemesterName("");
        setStartDate("");
        setEndDate("");
        setExistingNames([]);
      }
      setError("");
      setStartDateError("");
      setEndDateError("");
      setSemesterError("");
    };
    // Defer state updates to avoid React Compiler warning about sync setState in effect
    setTimeout(initForm, 0);
  }, [editData, schoolYearId, fetchExistingSemesters]);

  if (!show) return null;

  const handleSchoolYearChange = (value: string) => {
    setSchoolYearIdState(value);
    setSemesterName("");
    setSemesterError("");
    setError("");
    setExistingNames([]);
    if (value) {
      fetchExistingSemesters(value);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!schoolYearIdState) {
      setError("Please select a school year.");
      return;
    }
    if (!semesterName) {
      setSemesterError("Please select a semester.");
      return;
    }
    if (!startDate) {
      setStartDateError("Start date is required.");
      return;
    }
    if (!endDate) {
      setEndDateError("End date is required.");
      return;
    }

    if (endDate < startDate) {
      setEndDateError("End date cannot be before the start date.");
      return;
    }

    // Check for duplicate semester name within the same school year
    // Exclude current semester when editing
    const otherNames = editData
      ? existingNames.filter((name) => name !== editData.name)
      : existingNames;
    if (otherNames.includes(semesterName)) {
      setError(`Semester "${semesterName}" already exists for this school year.`);
      return;
    }

    try {
      let result;
      if (editData) {
        result = await updateSemester(editData.id, {
          name: semesterName,
          start_date: startDate,
          end_date: endDate,
        });
      } else {
        result = await createSemester({
          school_year_id: schoolYearIdState,
          name: semesterName,
          start_date: startDate,
          end_date: endDate,
        });
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message ?? "Failed to save semester.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <Modal title={editData ? "Edit Semester" : "Add New Semester"} onClose={onClose}>
      <div className="flex flex-col text-black gap-5">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* School Year Selection — custom inline select to match style */}
        <div className="flex flex-row shrink-0 gap-10 items-center">
          <label className="font-sm flex shrink-0 text-black">School Year</label>
          <select
            value={schoolYearIdState}
            onChange={(e) => handleSchoolYearChange(e.target.value)}
            disabled={!!editData}
            className="flex w-60 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a school year</option>
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester using the same Dropdown component as AddNewSchoolYear */}
        <Dropdown
          label="Choose Semester"
          value={semesterName}
          // temp
          options={[
            { value: "1st", label: "1st Semester" },
            { value: "2nd", label: "2nd Semester" },
            { value: "midyear", label: "Midyear" },
          ]}
          onSelect={(value) => {
            setSemesterName(value);
            setSemesterError("");
            setError("");
          }}
        />
        {semesterError && <p className="text-red-500 text-xs mt-1">{semesterError}</p>}

        <p>Semester Timeline:</p>

        <div className="flex items-center gap-10">
          <p>Start Date:</p>
          <input
            type="date"
            className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={(e) => {
              setStartDateError("");
              setError("");
              setStartDate(e.target.value);
            }}
          />
          {startDateError && <p className="text-red-500 text-xs mt-1">{startDateError}</p>}
        </div>

        <div className="flex items-center gap-11">
          <p>End Date:</p>
          <input
            type="date"
            className="p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              const selected = e.target.value;
              // Only allow dates on or after the start date
              if (startDate && selected < startDate) {
                setEndDateError("End date cannot be before the start date.");
                return;
              }
              setEndDateError("");
              setError("");
              setEndDate(selected);
            }}
          />
          {endDateError && <p className="text-red-500 text-xs mt-1">{endDateError}</p>}
        </div>

        {/* Buttons */}
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
