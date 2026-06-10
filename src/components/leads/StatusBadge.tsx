import type { LeadStatus } from "@/types/lead";
import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: LeadStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
}
