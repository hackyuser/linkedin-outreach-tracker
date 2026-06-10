import DashboardLayout from "@/components/layout/DashboardLayout";
import LeadsContent from "@/components/leads/LeadsContent";

export default function LeadsPage() {
  return (
    <DashboardLayout
      title="Leads"
      description="Manage and track your outreach leads"
      action={{ label: "Add Lead", href: "/leads/add" }}
    >
      <LeadsContent />
    </DashboardLayout>
  );
}
