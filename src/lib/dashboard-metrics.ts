import type { Lead } from "@/types/lead";

export interface DashboardMetrics {
  totalLeads: number;
  newLeadsAdded: number;
  invitationsSent: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  messagesSent: number;
  repliesReceived: number;
  acceptanceRate: number;
}

export function calculateDashboardMetrics(leads: Lead[]): DashboardMetrics {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const invitationsSent = leads.filter((l) => l.invitationSentDate !== null).length;
  const pendingInvitations = leads.filter((l) => l.status === "Pending").length;
  const acceptedInvitations = leads.filter((l) => l.status === "Accepted").length;

  const newLeadsAdded = leads.filter(
    (l) => new Date(l.createdAt) >= thirtyDaysAgo
  ).length;

  const messagesSent = leads.filter((l) => l.messageSentDate !== null).length;
  const repliesReceived = leads.filter((l) => l.replyDate !== null).length;

  const acceptanceRate =
    invitationsSent > 0
      ? Math.round((acceptedInvitations / invitationsSent) * 100)
      : 0;

  return {
    totalLeads: leads.length,
    newLeadsAdded,
    invitationsSent,
    pendingInvitations,
    acceptedInvitations,
    messagesSent,
    repliesReceived,
    acceptanceRate,
  };
}
