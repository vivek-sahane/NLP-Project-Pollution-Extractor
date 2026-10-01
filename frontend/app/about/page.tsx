import { Info, BookOpen, Layers, HelpCircle } from "lucide-react";

export default function AboutPage() {
  const vivaQuestions = [
    {
      q: "Q1: What is the core problem solved by the Pollution Source Extractor?",
      a: "Pollution information is scattered across unstructured news articles, government releases, and environmental complaints. The system automatically reads raw text and extracts 5 structured dimensions: Pollution Source, Pollutant, Location, Category, and Severity.",
    },
    {
      q: "Q2: How does the Named Entity Recognition (NER) module work?",
      a: "The system uses a hybrid NER approach. It combines spaCy pretrained NER models with a custom domain-specific EntityRuler pipeline and fallback pattern matching to recognize specialized environmental terms (e.g. chemical factory, PM2.5, sulfur dioxide, Pune).",
    },
    {
      q: "Q3: Why was TF-IDF + Logistic Regression chosen for category classification?",
      a: "TF-IDF provides explainable, lightweight feature extraction ideal for academic text mining without expensive external GPU resources or paid API costs. The classifier achieved 90.00% accuracy and 89.33% F1-score on the evaluation dataset.",
    },
    {
      q: "Q4: How does the system implement Explainable AI (XAI)?",
      a: "Instead of black-box outputs, the system preserves exact character spans, extraction methods (rule_match vs model_prediction), and surrounding text context snippets as evidence for every extracted entity and category.",
    },
    {
      q: "Q5: How does the database layer maintain reliability if MongoDB is absent?",
      a: "The backend includes a dual storage service (`DatabaseService`). If MongoDB daemon is unreachable, it automatically redirects storage operations to a local resilient store (`data/analyses_store.json`), keeping all CRUD and dashboard features 100% functional out of the box.",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Info className="w-3.5 h-3.5" /> Academic Documentation & Viva Guide
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          About Pollution Source Extractor
        </h1>
        <p className="text-slate-400 text-sm">
          Natural Language Processing & Text Mining System for Environmental Information Extraction.
        </p>
      </div>

      {/* Project Objectives */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" /> Project Objectives & Domain
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          The goal of this project is to convert unstructured pollution-related text into structured data suitable for storage, search, filtering, analysis, and dashboard visualization. The system operates fully locally without reliance on paid third-party APIs.
        </p>
      </div>

      {/* Technology Stack Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Academic Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold block">Frontend UI</span>
            <p className="text-slate-300">Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Recharts</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold block">Backend REST API</span>
            <p className="text-slate-300">Python 3.11+, FastAPI, Pydantic v2, Uvicorn ASGI server</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-sky-400 font-bold block">NLP & ML Core</span>
            <p className="text-slate-300">spaCy, EntityRuler, Scikit-Learn (TF-IDF + Logistic Regression), Pandas, NLTK, Joblib</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block">Database & Storage</span>
            <p className="text-slate-300">MongoDB (`pollution_analyses` collection) + Local Resilient Store Fallback</p>
          </div>
        </div>
      </div>

      {/* Viva Q&A Guide */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" /> Academic Viva Examination Q&A Guide
        </h3>
        <div className="space-y-4 pt-2">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">{item.q}</h4>
              <p className="text-slate-300 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Future Work */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-amber-400 uppercase tracking-wider">Project Limitations</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Extraction depends on input text quality and clarity.</li>
            <li>Location extraction identifies named locations, not spatial GPS boundaries.</li>
            <li>Dataset size is tailored for demonstration and baseline benchmarking.</li>
          </ul>
        </div>
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <h4 className="font-bold text-sky-400 uppercase tracking-wider">Future Enhancements</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Transformer-based fine-tuned BERT/RoBERTa classifiers.</li>
            <li>Multilingual news extraction for regional languages.</li>
            <li>Geospatial OpenStreetMap coordinate mapping.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
