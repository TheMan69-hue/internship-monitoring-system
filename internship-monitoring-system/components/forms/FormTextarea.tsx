type FormTextareaProps = {
  label: string;
  rows?: number;
  placeholder?: string;
};

export default function FormTextarea({
  label,
  rows = 3,
  placeholder,
}: FormTextareaProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>

      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
      />
    </div>
  );
}