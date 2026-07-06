type FormInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
};

export default function FormInput({
  label,
  type = "text",
  placeholder,
}: FormInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-[#D1D5DB] px-4 py-2 text-[#374151] outline-none transition focus:border-[#2563EB]"
      />
    </div>
  );
}