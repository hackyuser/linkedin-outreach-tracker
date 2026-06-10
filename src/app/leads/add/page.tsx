import DashboardLayout from "@/components/layout/DashboardLayout";
import LeadForm from "@/components/leads/LeadForm";

export default function AddLeadPage() {
  return (
    <DashboardLayout
      title="Add Lead"
      description="Add a new lead to your outreach pipeline"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <LeadForm />
      </div>
    </DashboardLayout>
  );
}
