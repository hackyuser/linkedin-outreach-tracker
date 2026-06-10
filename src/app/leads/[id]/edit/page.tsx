import DashboardLayout from "@/components/layout/DashboardLayout";
import EditLeadContent from "@/components/leads/EditLeadContent";

export default function EditLeadPage() {
  return (
    <DashboardLayout
      title="Edit Lead"
      description="Update lead information in your outreach pipeline"
    >
      <EditLeadContent />
    </DashboardLayout>
  );
}
