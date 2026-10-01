"use client";

import { useState } from "react";
import { Factory, Flame, MapPin, AlertTriangle, ShieldCheck, ArrowRight, Save, CheckCircle2, Clock } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface Props {
  result: AnalysisResult;
  onSaveSuccess?: () => void;
}

export default function ResultCard({ result, onSaveSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!result) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/analyze/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: {
            inputText: result.input_text,
            source: result.source,
            pollutants: result.pollutants,
            locations: result.locations,
            pollutionCategory: result.pollution_category,
            severity: result.severity,
            entities: result.entities,
            relationships: result.relationships,
            summary: result.summary,
            confidence: result.confidence_summary,
            processingTimeMs: result.processing_time_ms,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadgeClass = (sevLabel: string) => {
    switch (sevLabel) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/50";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/50";
      case "Moderate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">
            Extracted Structured Result
          </span>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {result.pollution_category}
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {(result.category_confidence * 100).toFixed(0)}% confidence
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {result.processing_time_ms} ms
          </span>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
              saved
                ? "bg-emerald-600 text-white shadow-emerald-900/40"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-emerald-500/20"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved to History
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Analysis"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Source Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Factory className="w-4 h-4" /> Pollution Source
          </div>
          <p className="font-bold text-slate-100 text-base">
            {result.source.name}
          </p>
          <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            {result.source.category}
          </span>
        </div>

        {/* Pollutants Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4" /> Pollutant(s)
          </div>
          <div className="space-y-1">
            {result.pollutants.map((p, i: number) => (
              <p key={i} className="font-bold text-slate-100 text-base capitalize">
                {p.name}
              </p>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
            <MapPin className="w-4 h-4" /> Location
          </div>
          <div className="space-y-1">
            {result.locations.map((l, i: number) => (
              <p key={i} className="font-bold text-slate-100 text-base">
                {l.name}
              </p>
            ))}
          </div>
        </div>

        {/* Severity Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" /> Severity Level
          </div>
          <p className="font-bold text-slate-100 text-base">
            {result.severity.label || "Unknown"}
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded text-[11px] border font-semibold ${getSeverityBadgeClass(
              result.severity.label
            )}`}
          >
            {result.severity.matched_indicator ? `Matched: "${result.severity.matched_indicator}"` : "Contextual"}
          </span>
        </div>
      </div>

      {/* Relationships Triple Flow */}
      {result.relationships && result.relationships.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Semantic Relationship Mapping:
          </h4>
          {result.relationships.map((rel, idx: number) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-center md:justify-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-sm font-medium"
            >
              <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {rel.source}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                emits {rel.pollutant}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-3 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                affects {rel.location}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* XAI Explainability Section */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Explainable AI (XAI) Synthesis
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {result.summary}
        </p>
      </div>
    </div>
  );
}
