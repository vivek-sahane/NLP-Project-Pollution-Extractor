"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RefreshCw, FileText, Code } from "lucide-react";
import EntityHighlight from "@/components/EntityHighlight";
import ResultCard from "@/components/ResultCard";
import type { AnalysisItem } from "@/types";

export default function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [item, setItem] = useState<AnalysisItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/analyses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItem(data.data);
        } else {
          setError(data.detail || "Record not found.");
        }
      })
      .catch(() => setError("Failed to fetch analysis detail."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this analysis record?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/analyses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/history");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Loading Analysis Details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-rose-400 font-semibold">{error || "Analysis record not found."}</p>
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  // Format analysis result structure
  const formattedResult = {
    input_text: item.inputText,
    summary: item.summary || "No summary available.",
    pollution_category: item.pollutionCategory || "Unknown",
    category_confidence: item.confidence?.category || 0.90,
    category_method: "trained_tfidf_model",
    source: item.source || { name: "Unknown", category: "Unknown", confidence: 0 },
    pollutants: item.pollutants || [],
    locations: item.locations || [],
    severity: item.severity || { label: "Unknown" },
    entities: item.entities || [],
    relationships: item.relationships || [],
    confidence_summary: item.confidence || {},
    processing_time_ms: item.processingTimeMs || 0,
  };

  const handleAnalyzeAgain = () => {
    router.push(`/?text=${encodeURIComponent(item.inputText)}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeAgain}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Analyze Again
          </button>
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Code className="w-4 h-4 text-emerald-400" /> {showJson ? "Hide Raw JSON" : "View Raw JSON"}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <FileText className="w-4 h-4" /> Analysis Record ID: {id}
        </div>
        <h1 className="text-2xl font-black text-white">
          {item.pollutionCategory} Analysis
        </h1>
        <p className="text-xs text-slate-400">
          Created on {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown"} &bull; Processing time: {item.processingTimeMs ?? 0} ms
        </p>
      </div>

      {/* Raw JSON View Option */}
      {showJson && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs text-emerald-300 overflow-x-auto">
          <span className="text-slate-500 block">Raw Stored Document JSON:</span>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
      )}

      {/* Original Text with Entity Highlights */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Original Input Text & Named Entities:
        </h3>
        <EntityHighlight text={item.inputText} entities={item.entities || []} />
      </div>

      {/* Result Visualizations */}
      <ResultCard result={formattedResult} />
    </div>
  );
}
