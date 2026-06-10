"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LeadForm from "@/components/leads/LeadForm";
import { useAuth } from "@/contexts/AuthContext";
import { getLeadById } from "@/lib/firebase";
import type { LeadFormData } from "@/types/lead";

export default function EditLeadContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const leadId = params.id as string;
  const [initialData, setInitialData] = useState<LeadFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLead() {
      if (!user) return;

      try {
        const lead = await getLeadById(user.uid, leadId);
        if (!lead) {
          setError("Lead not found");
          return;
        }
        setInitialData({
          fullName: lead.fullName,
          company: lead.company,
          designation: lead.designation,
          linkedinUrl: lead.linkedinUrl,
          status: lead.status,
          notes: lead.notes,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    }

    loadLead();
  }, [user, leadId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Lead not found"}
        </div>
        <button
          type="button"
          onClick={() => router.push("/leads")}
          className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-card">
      <LeadForm mode="edit" leadId={leadId} initialData={initialData} />
    </div>
  );
}
