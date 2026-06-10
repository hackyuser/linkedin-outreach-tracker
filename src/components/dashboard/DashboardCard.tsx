interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`mt-2 text-xs font-medium ${
                trend.positive ? "text-emerald-600" : "text-slate-500"
              }`}
            >
              {trend.label}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
