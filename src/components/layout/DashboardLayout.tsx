import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AuthGuard from "@/components/auth/AuthGuard";
import { LeadsProvider } from "@/contexts/LeadsContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function DashboardLayout({
  children,
  title,
  description,
  action,
}: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <LeadsProvider>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopNav title={title} description={description} action={action} />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </div>
      </LeadsProvider>
    </AuthGuard>
  );
}
