"use client";

import { useEffect, useState } from "react";
import { Cpu, CheckCircle2, Award, BarChart2, Layers } from "lucide-react";

interface ModelMetrics {
  dataset_info?: { total_samples?: number; train_samples?: number; validation_samples?: number; test_samples?: number };
  metrics?: { accuracy: number; precision: number; recall: number; f1_score: number };
  labels: string[];
  confusion_matrix: number[][];
}
interface ModelResponse {
  success: boolean;
  evaluated: boolean;
  model_status?: string;
  message?: string;
  metrics?: ModelMetrics | null;
}

export default function ModelPage() {
  const [modelData, setModelData] = useState<ModelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/model/metrics")
      .then((res) => res.json())
      .then((data) => setModelData(data))
      .catch((err) => console.error("Error fetching model metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const pipelineSteps = [
    { name: "Raw Text Input", desc: "Unstructured news / report text" },
    { name: "Text Preprocessing", desc: "Whitespace normalization & domain token preservation" },
    { name: "Hybrid NER Engine", desc: "spaCy pretrained NER + EntityRuler patterns" },
    { name: "Entity Extraction", desc: "POLLUTION_SOURCE, POLLUTANT, LOCATION, SEVERITY" },
    { name: "TF-IDF ML Classifier", desc: "Logistic Regression category classifier" },
    { name: "Structured Result", desc: "JSON output with XAI context evidence" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" /> NLP Model Evaluation & Pipeline
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Machine Learning Model Performance
        </h1>
        <p className="text-slate-400 text-sm">
          Technical evaluation report and NLP architecture specification.
        </p>
      </div>

      {/* Pipeline Steps Flow */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> End-to-End NLP Architecture Flow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {pipelineSteps.map((step, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 relative group hover:border-emerald-500/40 transition-colors"
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Step 0{i + 1}
              </span>
              <h4 className="font-bold text-white text-sm">
                {step.name}
              </h4>
              <p className="text-xs text-slate-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance Section */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Loading evaluation metrics...
        </div>
      ) : modelData?.evaluated && modelData?.metrics ? (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-slate-200 block">
                  {modelData.model_status}
                </span>
                <span className="text-emerald-400">
                  Model verified & serialized in `models/pollution_classifier.joblib`
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              Evaluated
            </span>
          </div>

          {/* Dataset Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Total Dataset</span>
              <span className="text-2xl font-extrabold text-white">
                {modelData.metrics.dataset_info?.total_samples || 60}
              </span>
              <span className="text-[10px] text-slate-500 block">Samples</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Train Split</span>
              <span className="text-2xl font-extrabold text-emerald-400">
                {modelData.metrics.dataset_info?.train_samples || 40}
              </span>
              <span className="text-[10px] text-slate-500 block">Samples</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Validation Split</span>
              <span className="text-2xl font-extrabold text-sky-400">
                {modelData.metrics.dataset_info?.validation_samples || 10}
              </span>
              <span className="text-[10px] text-slate-500 block">Samples</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Test Split</span>
              <span className="text-2xl font-extrabold text-amber-400">
                {modelData.metrics.dataset_info?.test_samples || 10}
              </span>
              <span className="text-[10px] text-slate-500 block">Samples</span>
            </div>
          </div>

          {/* Metrics Table */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Evaluation Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Accuracy</span>
                <span className="text-3xl font-black text-emerald-400">
                  {((modelData.metrics.metrics?.accuracy ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Precision</span>
                <span className="text-3xl font-black text-sky-400">
                  {((modelData.metrics.metrics?.precision ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">Recall</span>
                <span className="text-3xl font-black text-amber-400">
                  {((modelData.metrics.metrics?.recall ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 block font-semibold">F1-Score</span>
                <span className="text-3xl font-black text-purple-400">
                  {((modelData.metrics.metrics?.f1_score ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          {modelData.metrics.confusion_matrix && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Confusion Matrix Grid
              </h3>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-center text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-3 text-left">Actual \ Predicted</th>
                      {modelData.metrics.labels.map((lbl: string, i: number) => (
                        <th key={i} className="p-3">{lbl}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modelData.metrics.confusion_matrix.map((row: number[], idx: number) => (
                      <tr key={idx} className="border-b border-slate-800/60">
                        <td className="p-3 font-bold text-left text-emerald-400">
                          {modelData.metrics?.labels[idx]}
                        </td>
                        {row.map((val: number, cIdx: number) => (
                          <td
                            key={cIdx}
                            className={`p-3 font-mono font-bold ${
                              idx === cIdx ? "bg-emerald-500/20 text-emerald-300" : "text-slate-500"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <p className="text-slate-300 font-semibold">
            {modelData?.message || "Model has not yet been evaluated."}
          </p>
          <p className="text-xs text-slate-500">
            Execute `python backend/scripts/train_classifier.py` to generate trained evaluation metrics.
          </p>
        </div>
      )}
    </div>
  );
}
