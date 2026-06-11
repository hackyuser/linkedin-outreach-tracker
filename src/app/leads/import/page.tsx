import DashboardLayout from "@/components/layout/DashboardLayout";
import LeadImportContent from "@/components/leads/LeadImportContent";

export default function BulkUploadLeadsPage() {
  return (
    <DashboardLayout
      title="Bulk Upload Leads"
      description="Import leads from a CSV or Excel file"
    >
      <LeadImportContent />
    </DashboardLayout>
  );
}
