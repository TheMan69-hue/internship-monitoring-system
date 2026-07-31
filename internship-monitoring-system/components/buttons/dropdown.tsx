"use client";

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  label: string;
  options: DropdownOption<T>[];
  value?: T;
  onSelect: (value: T) => void;
  placeholder?: string;
};

export default function Dropdown<T extends string>({
  label,
  options,
  value,
  onSelect,
  placeholder = "Select an option",
}: DropdownProps<T>) {
  return (
    <div className="flex flex-row shrink-0 gap-10 items-center">
      <label className="font-sm flex shrink-0 text-black">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onSelect(e.target.value as T)}
        className="flex w-34 p-1 text-sm text-gray-500 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
