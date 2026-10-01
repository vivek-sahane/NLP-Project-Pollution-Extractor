"use client";

import { useState } from "react";
import { Factory, Flame, MapPin, AlertTriangle, Search } from "lucide-react";

interface Entity {
  text: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
  method: string;
  evidence?: string;
}

interface Props {
  text: string;
  entities: Entity[];
}

export default function EntityHighlight({ text, entities }: Props) {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  if (!text) return null;

  // Sort entities by character start position
  const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

  // Render text fragments mixed with highlighted spans
  const renderHighlightedText = () => {
    if (!sortedEntities.length) {
      return <p className="text-slate-300 leading-relaxed">{text}</p>;
    }

    const elements = [];
    let lastIndex = 0;

    sortedEntities.forEach((ent, idx) => {
      // Add preceding plain text fragment
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`plain-${lastIndex}`}>
            {text.substring(lastIndex, ent.start)}
          </span>
        );
      }

      // Determine CSS styling based on entity type
      let badgeStyle = "entity-source";
      let icon = <Factory className="w-3.5 h-3.5 inline mr-1" />;

      if (ent.type === "POLLUTANT") {
        badgeStyle = "entity-pollutant";
        icon = <Flame className="w-3.5 h-3.5 inline mr-1" />;
      } else if (ent.type === "LOCATION") {
        badgeStyle = "entity-location";
        icon = <MapPin className="w-3.5 h-3.5 inline mr-1" />;
      } else if (ent.type === "SEVERITY") {
        badgeStyle = "entity-severity";
        icon = <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />;
      }

      elements.push(
        <button
          key={`ent-${idx}-${ent.start}`}
          onClick={() => setSelectedEntity(ent)}
          className={`${badgeStyle} cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center mx-0.5`}
          title={`Click to view entity details (${ent.type})`}
        >
          {icon}
          {ent.text}
        </button>
      );

      lastIndex = ent.end;
    });

    // Add trailing text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`plain-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }

    return <div className="text-slate-200 leading-relaxed text-base">{elements}</div>;
  };

  return (
    <div className="space-y-4">
      {/* Entity Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <span className="font-semibold text-slate-400 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-emerald-400" /> Extracted Entity Legend:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <Factory className="w-3 h-3" /> Source
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Pollutant
          </span>
          <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Severity
          </span>
        </div>
      </div>

      {/* Main Text Content */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-inner">
        {renderHighlightedText()}
      </div>

      {/* Entity Details Drawer/Modal */}
      {selectedEntity && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {selectedEntity.type}
              </span>
              <h4 className="font-semibold text-slate-100 text-base">
                &quot;{selectedEntity.text}&quot;
              </h4>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">System Confidence</span>
              <span className="font-bold text-emerald-400 text-sm">
                {(selectedEntity.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Extraction Method</span>
              <span className="font-medium text-slate-200 capitalize">
                {selectedEntity.method.replace("_", " ")}
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 col-span-2 md:col-span-1">
              <span className="text-slate-400 block">Span Offset</span>
              <span className="font-mono text-slate-300">
                Ch [{selectedEntity.start}:{selectedEntity.end}]
              </span>
            </div>
          </div>

          {selectedEntity.evidence && (
            <div className="text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block font-semibold mb-1">
                XAI Explainability Context Evidence:
              </span>
              <p className="italic text-emerald-200/90">
                &quot;{selectedEntity.evidence}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
