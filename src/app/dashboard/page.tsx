import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your LinkedIn outreach performance"
      action={{ label: "Add Lead", href: "/leads/add" }}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}
