type FormSelectProps = {
  label: string;
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  options: string[];
  onChange?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function FormSelect({
  label,
  name,
  value,
  required = false,
  disabled = false,
  options,
  onChange,
}: FormSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB] disabled:bg-[#F3F4F6]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}