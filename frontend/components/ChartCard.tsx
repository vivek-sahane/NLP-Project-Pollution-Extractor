import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ChartCard({ title, subtitle, children }: Props) {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
      <div>
        <h3 className="text-base font-bold text-slate-100">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="w-full h-[280px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
