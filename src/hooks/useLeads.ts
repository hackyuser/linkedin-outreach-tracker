"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, LeadFormData, LeadStatus } from "@/types/lead";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getLeads(user.uid);
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (formData: LeadFormData) => {
    if (!user) throw new Error("Not authenticated");

    const newLead = await createLead(user.uid, {
      ...formData,
      invitationSentDate: null,
      acceptedDate: null,
      messageSentDate: null,
      replyDate: null,
    });

    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const changeLeadStatus = async (leadId: string, status: LeadStatus) => {
    if (!user) throw new Error("Not authenticated");

    const updated = await updateLeadStatus(user.uid, leadId, status);
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? updated : lead))
    );
    return updated;
  };

  const removeLead = async (leadId: string) => {
    if (!user) throw new Error("Not authenticated");

    await deleteLead(user.uid, leadId);
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  const fetchLead = useCallback(
    async (leadId: string): Promise<Lead | null> => {
      if (!user) throw new Error("Not authenticated");

      const cached = leads.find((lead) => lead.id === leadId);
      if (cached) return cached;

      return getLeadById(user.uid, leadId);
    },
    [user, leads]
  );

  const editLead = async (leadId: string, formData: LeadFormData) => {
    if (!user) throw new Error("Not authenticated");

    const updated = await updateLead(user.uid, leadId, formData);
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? updated : lead))
    );
    return updated;
  };

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    fetchLead,
    addLead,
    editLead,
    changeLeadStatus,
    removeLead,
  };
}
