"use client";

type dropdownProp = {
    label: string;
    options: string[];
    onSelect: (value: string) => void;
    placeholder?: string;
}

export default function Dropdown({
    label,
    options,
    onSelect,
    placeholder = 'Select an option'
}: dropdownProp){
    return(
        <div className="flex flex-row shrink-0 gap-10 items-center">
            <label htmlFor="year-filter-select" className="font-sm flex shrink-0 text-black">{label}</label>
            <select
                id="select-filter"
                onChange={(e) => onSelect(e.target.value)}
                className="flex w-34 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
                ))}
            </select>
        </div>
    );
}