"use client";

import { useEffect, useState } from "react";
import { BarChart3, PieChart as PieIcon, Activity, Flame, Factory } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import ChartCard from "@/components/ChartCard";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats, DashboardDatum } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  "Air Pollution": "#10b981", // emerald
  "Water Pollution": "#0ea5e9", // sky
  "Soil Pollution": "#f59e0b", // amber
  "Noise Pollution": "#a855f7", // purple
  "Other": "#64748b", // slate
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error("Error loading dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading Analytics Dashboard Data...</p>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate summary stats
  const total = stats.totalAnalyses || 0;
  const airCount = stats.categoryDistribution.find((c) => c.name === "Air Pollution")?.value || 0;
  const waterCount = stats.categoryDistribution.find((c) => c.name === "Water Pollution")?.value || 0;
  const indCount = stats.sourceCategoryDistribution.find((s) => s.name.includes("Industrial"))?.value || 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-400" /> Pollution Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time aggregate data visualization powered by {stats.databaseType}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
          Total Analyzed Records: {total}
        </span>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Analyses"
          value={total}
          subtitle="Total processed documents"
          icon={Activity}
          color="emerald"
        />
        <MetricCard
          title="Air Pollution Share"
          value={total > 0 ? `${((airCount / total) * 100).toFixed(0)}%` : "0%"}
          subtitle={`${airCount} total instances`}
          icon={Flame}
          color="emerald"
        />
        <MetricCard
          title="Water Pollution Share"
          value={total > 0 ? `${((waterCount / total) * 100).toFixed(0)}%` : "0%"}
          subtitle={`${waterCount} total instances`}
          icon={PieIcon}
          color="sky"
        />
        <MetricCard
          title="Industrial Sources"
          value={total > 0 ? `${((indCount / total) * 100).toFixed(0)}%` : "0%"}
          subtitle={`${indCount} factory/plant sources`}
          icon={Factory}
          color="amber"
        />
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <ChartCard title="Pollution Category Breakdown" subtitle="Distribution of Air, Water, Soil, Noise & Other categories">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.categoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {stats.categoryDistribution.map((entry: DashboardDatum, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.name] || "#64748b"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Source Category Bar Chart */}
        <ChartCard title="Top Pollution Sources" subtitle="Primary source categories identified across texts">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.sourceCategoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Pollutants Bar Chart */}
        <ChartCard title="Top Extracted Pollutants" subtitle="Most frequently detected pollutant chemicals/compounds">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topPollutants} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Locations Bar Chart */}
        <ChartCard title="Geographic Hotspots" subtitle="Top cities and waterbodies mentioned in pollution reports">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topLocations} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severity Distribution" subtitle="Explicit severity levels detected in analyzed records">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.severityDistribution}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }} />
              <Bar dataKey="value" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Analyses Over Time" subtitle="Saved analysis records by date">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.analysesOverTime}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }} />
              <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
