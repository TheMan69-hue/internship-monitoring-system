import Button from "../buttons/buttons";
import { RotateCw } from 'lucide-react';
import '@/app/globals.css';
interface YearFilterProps {
  yearLabel: string;
  yearOptions: { value: string; label: string }[];
  yearValue: string;
  onYearChange: (value: string) => void;
  semesterLabel: string;
  semesterOptions: { value: string; label: string }[];
  semesterValue: string;
  onSemesterChange: (value: string) => void;
  placeholder?: string;
}

export default function YearFilter({
  yearLabel,
  yearOptions,
  yearValue,
  onYearChange,
  semesterLabel,
  semesterOptions,
  semesterValue,
  onSemesterChange,
  placeholder = 'Select an option'
}: YearFilterProps) {
  return (
    <div className="flex overflow-none flex-auto w-full shrink-0 py-5">
        <div className="flex flex-row gap-5 items-center">
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
            <div className="flex flex-row gap-3 items-center">
                <label htmlFor="semester-filter-select" className="text-sm font-sm flex shrink-0 text-black">{semesterLabel}</label>
                <select
                    id="semester-filter-select"
                    value={semesterValue}
                    onChange={(e) => onSemesterChange(e.target.value)}
                    className="flex w-34 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">{placeholder}</option>
                    {semesterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
            </div>
            <Button 
            icon= {<RotateCw className="h-[15] w-[15]"/>}
            type="submit"
            variant="primary"
            size="sm"
            >Load Academic Year</Button>
        </div>
    </div>
  );
}