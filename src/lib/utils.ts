import type { LeadStatus } from "@/types/lead";

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function getStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    Pending: "bg-orange-100 text-orange-800",
    "Lead Added": "bg-slate-100 text-slate-700",
    "Invitation Sent": "bg-amber-100 text-amber-800",
    Accepted: "bg-emerald-100 text-emerald-800",
    "Message Sent": "bg-blue-100 text-blue-800",
    Replied: "bg-violet-100 text-violet-800",
    "Opportunity Created": "bg-green-100 text-green-800",
  };
  return colors[status];
}
