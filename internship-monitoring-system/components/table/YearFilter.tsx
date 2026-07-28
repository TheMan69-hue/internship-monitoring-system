import Button from "../buttons/buttons";
import { RotateCw } from 'lucide-react';
import '@/app/globals.css';
// ── Props ──────────────────────────────────────────────────────────
// All props are passed down from the parent page component.
// The component itself is stateless — it just renders the UI and fires callbacks.

interface YearFilterProps {
  // Year dropdown
  yearLabel: string;                                                // Label text (e.g. "Academic Year")
  yearOptions: { value: string; label: string }[];                 // All school years from DB
  yearValue: string;                                                // Currently selected year
  onYearChange: (value: string) => void;                           // Called when user picks a year

  // Semester dropdown
  semesterLabel: string;                                            // Label text (e.g. "Semester")
  semesterOptions: { value: string; label: string }[];             // Semesters for the selected year
  semesterValue: string;                                            // Currently selected semester
  onSemesterChange: (value: string) => void;                       // Called when user picks a semester

  // Load button — parent decides what to do with the selected filter values
  onLoad: (year: string, semester: string) => void;                // Called when "Load Academic Year" is clicked
  semesterDisabled?: boolean;                                       // Disables semester dropdown until a year is chosen
  placeholder?: string;                                             // Placeholder text for both dropdowns
}

/**
 * YearFilter — A reusable filter bar with two dependent dropdowns (Academic Year + Semester)
 * and a "Load Academic Year" button.
 *
 * Behavior:
 * 1. The year dropdown is populated on page load with all school years from the DB.
 * 2. The semester dropdown starts disabled and empty.
 * 3. When a year is selected, the parent calls getSemestersBySchoolYear() and passes
 *    the results back as semesterOptions + sets semesterDisabled=false.
 * 4. When both are selected and the button is clicked, onLoad(year, semester) fires.
 * 5. The button is disabled until both dropdowns have a value.
 */
export default function YearFilter({
  yearLabel,
  yearOptions,
  yearValue,
  onYearChange,
  semesterLabel,
  semesterOptions,
  semesterValue,
  onSemesterChange,
  onLoad,
  semesterDisabled = false,
  placeholder = 'Select an option'
}: YearFilterProps) {
  return (
    <div className="flex overflow-none flex-auto w-full shrink-0 py-5">
        <div className="flex flex-row gap-5 items-center">

            {/* ── Academic Year Dropdown ── */}
            <div className="flex flex-row shrink-0 gap-3 items-center">
                <label htmlFor="year-filter-select" className="text-sm font-sm flex shrink-0 text-black">{yearLabel}</label>
                <select
                    id="year-filter-select"
                    value={yearValue}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="flex w-34 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">{placeholder}</option>
                    {yearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
            </div>

            {/* ── Semester Dropdown (disabled until a year is selected) ── */}
            <div className="flex flex-row gap-3 items-center">
                <label htmlFor="semester-filter-select" className="text-sm font-sm flex shrink-0 text-black">{semesterLabel}</label>
                <select
                    id="semester-filter-select"
                    value={semesterValue}
                    onChange={(e) => onSemesterChange(e.target.value)}
                    disabled={semesterDisabled}
                    className="flex w-34 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">{placeholder}</option>
                    {semesterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
            </div>

            {/* ── Load Button — disabled until both dropdowns have a selection ── */}
            <Button
              icon={<RotateCw className="h-[15] w-[15]" />}
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onLoad(yearValue, semesterValue)}
              disabled={!yearValue || !semesterValue}
            >
              Load Academic Year
            </Button>
        </div>
    </div>
  );
}