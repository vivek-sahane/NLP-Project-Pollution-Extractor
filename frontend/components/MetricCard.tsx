import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export default function MetricCard({ title, value, subtitle, icon: Icon, color = "emerald" }: Props) {
  const getColorClasses = () => {
    switch (color) {
      case "amber":
        return "from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400 shadow-amber-500/10";
      case "sky":
        return "from-sky-500/20 to-sky-900/10 border-sky-500/30 text-sky-400 shadow-sky-500/10";
      case "rose":
        return "from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400 shadow-rose-500/10";
      default:
        return "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10";
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br border glass-card glass-card-hover space-y-3 shadow-lg ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
