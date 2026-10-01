"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Search, Trash2, Eye, ChevronLeft, ChevronRight, Factory, Flame, MapPin } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import type { AnalysisItem } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort_by: sortBy,
      });

      if (search) params.append("search", search);
      if (category !== "all") params.append("category", category);
      if (severity !== "all") params.append("severity", severity);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const res = await fetch(`http://localhost:8000/api/analyses?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetching remote data here intentionally updates loading/results state asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchHistory();
  }, [page, search, category, severity, sortBy, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis record?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/analyses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleReset = () => {
    setSearch("");
    setCategory("all");
    setSeverity("all");
    setSortBy("newest");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-emerald-400" /> Saved Analysis History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, filter, inspect, and manage historical pollution extraction records.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          Showing {items.length} of {total} records
        </span>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        severity={severity}
        setSeverity={setSeverity}
        sortBy={sortBy}
        setSortBy={setSortBy}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onReset={handleReset}
      />

      {/* Table Container */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs">Loading records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No analysis records match your search query.</p>
            <button
              onClick={handleReset}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Pollutant</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((item) => {
                  const id = item._id || item.id;
                  const srcName = item.source?.name || "Unknown";
                  const srcCat = item.source?.category || "General";
                  const polName = item.pollutants?.[0]?.name || "None";
                  const locName = item.locations?.[0]?.name || "Unspecified";
                  const sevLabel = item.severity?.label || "Unknown";
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent";

                  return (
                    <tr key={id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-white block">
                          {item.pollutionCategory || "Other"}
                        </span>
                        {item.isDemo && (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            Demo Data
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Factory className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {srcName}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {srcCat}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-amber-300 font-medium capitalize">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {polName}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sky-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          {locName}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            sevLabel === "Critical"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : sevLabel === "High"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {sevLabel}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{dateStr}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/analysis/${id}`}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="View Analysis Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => id && handleDelete(id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 font-semibold"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
