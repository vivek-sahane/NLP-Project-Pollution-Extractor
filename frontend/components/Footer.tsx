import { Leaf, Cpu, Database, Layers } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            Pollution Source Extractor
          </span>
          <span>&mdash; Academic AI / NLP Project</span>
        </div>

        {/* Stack Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-emerald-400" /> spaCy & Scikit-Learn
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-teal-400" /> FastAPI + Pydantic
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Database className="w-3 h-3 text-sky-400" /> MongoDB / Local Store
          </span>
        </div>

        <p className="text-slate-500">
          Academic Research & Development
        </p>
      </div>
    </footer>
  );
}
