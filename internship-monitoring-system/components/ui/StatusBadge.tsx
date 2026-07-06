import type {
  RegistrationStatus,
  InternshipStatus,
} from "@/lib/types";
type StatusBadgeProps = {
  status: RegistrationStatus | InternshipStatus;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const colors = {
        Approved: "bg-[#16A34A] text-white",
        Pending: "bg-[#EAB308] text-white",
        Active: "bg-[#2563EB] text-white",
        Completed: "bg-[#6B7280] text-white",
    }[status];

  return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${colors}`}
      >
        {status}
      </span>
  );
}