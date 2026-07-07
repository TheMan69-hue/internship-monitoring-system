type FormTextareaProps = {
  label: string;
  name?: string;
  rows?: number;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

export default function FormTextarea({
  label,
  name,
  rows = 3,
  value,
  placeholder,
  required = false,
  disabled = false,
  onChange,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>

      <textarea
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB] disabled:bg-[#F3F4F6]"
      />
    </div>
  );
}