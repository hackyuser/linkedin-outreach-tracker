"use client";

import LeadTable from "@/components/leads/LeadTable";
import { useLeads } from "@/hooks/useLeads";

export default function LeadsContent() {
  const { leads, loading, error, changeLeadStatus, removeLead } = useLeads();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <LeadTable
      leads={leads}
      onStatusChange={async (leadId, status) => {
        await changeLeadStatus(leadId, status);
      }}
      onDelete={async (leadId) => {
        await removeLead(leadId);
      }}
    />
  );
}
