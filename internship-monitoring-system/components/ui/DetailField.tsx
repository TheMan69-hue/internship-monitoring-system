type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

export default function DetailField({
  label,
  value,
}: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </p>

      <p className="mt-1 text-base font-medium text-[#111827] break-words">
        {value}
      </p>
    </div>
  );
}