"use client";

import { useState } from "react";
import { Leaf, Sparkles, Link2, Upload, Trash2, AlertCircle, FileText } from "lucide-react";
import EntityHighlight from "@/components/EntityHighlight";
import ResultCard from "@/components/ResultCard";
import type { AnalysisResult } from "@/types";

const PRESET_EXAMPLES = [
  {
    label: "Pune Chemical Factory",
    text: "A chemical factory near Pune released sulfur dioxide into the atmosphere, causing severe air pollution in nearby residential areas.",
  },
  {
    label: "Delhi Crop Burning",
    text: "Smoke from agricultural stubble burning in Punjab caused dangerous levels of PM2.5 in New Delhi.",
  },
  {
    label: "River Sewage Discharge",
    text: "Untreated municipal sewage was discharged into the Godavari river near Nashik, contaminating local drinking water.",
  },
  {
    label: "Construction Noise",
    text: "Excessive noise pollution from heavy machinery at a metro construction site in Bengaluru disturbed residents.",
  },
];

export default function AnalyzerPage() {
  const [inputText, setInputText] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("text") ?? "";
  });
  const [inputUrl, setInputUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "url" | "file">("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText || inputText;
    if (!textToAnalyze || textToAnalyze.trim().length < 5) {
      setError("Please enter or paste at least 5 characters of pollution text.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setAnalysisResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to communicate with NLP Backend API.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!inputUrl || !inputUrl.startsWith("http")) {
      setError("Please enter a valid HTTP/HTTPS news article URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || "URL analysis failed.");
      }

      setInputText(data.result.input_text);
      setAnalysisResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not retrieve text from URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/analyze/file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || "File analysis failed.");
      }

      setInputText(data.result.input_text);
      setAnalysisResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "File text parsing error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Academic AI / NLP Text Mining System
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Pollution Source Extractor
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Automatically extract structured pollution sources, pollutants, locations, categories, and severity levels from unstructured environmental text.
        </p>
      </div>

      {/* Preset Test Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
          Quick Preset Academic Test Cases:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(ex.text);
                handleAnalyze(ex.text);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-medium transition-all"
            >
              ⚡ {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analyzer Card */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl">
        {/* Method Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "text"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" /> Text Input
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "url"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Link2 className="w-4 h-4" /> News Article URL
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "file"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" /> Document Upload (.txt/.pdf)
          </button>
        </div>

        {/* Input Forms */}
        {activeTab === "text" && (
          <div className="space-y-3">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a pollution-related news article, government report, or environmental complaint text here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        )}

        {activeTab === "url" && (
          <div className="space-y-3">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://news.example.com/pollution-report-pune"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-400">
              Scrapes article text automatically and executes the NLP pipeline.
            </p>
          </div>
        )}

        {activeTab === "file" && (
          <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center space-y-3 bg-slate-950/40">
            <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Upload .txt or .pdf document
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Extracts document text and runs NLP information extraction.
              </p>
            </div>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setInputText("");
              setInputUrl("");
              setAnalysisResult(null);
              setError(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear Input
          </button>

          <button
            onClick={() => (activeTab === "url" ? handleAnalyzeUrl() : handleAnalyze())}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Processing NLP Pipeline...
              </>
            ) : (
              <>
                <Leaf className="w-4 h-4" /> Analyze Pollution
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Entity Highlighting Box */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Original Text with Extracted Named Entities:
            </h3>
            <EntityHighlight
              text={analysisResult.input_text}
              entities={analysisResult.entities || []}
            />
          </div>

          {/* Result Cards & Triples */}
          <ResultCard result={analysisResult} />
        </div>
      )}
    </div>
  );
}
