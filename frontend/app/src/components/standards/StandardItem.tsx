"use client";

import { useState } from "react";

interface StandardItemProps {
  id: string;
  title: string;
  icon: string;
  weight: number; // Percentage importance weight (e.g., 20)
  description: string;
  criteria: string[];
  exemplarDialogue: {
    bad: string;
    good: string;
  };
}

export default function StandardItem({
  title,
  icon,
  weight,
  description,
  criteria,
  exemplarDialogue,
}: StandardItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article 
      className={`border rounded-lg transition-all duration-200 overflow-hidden bg-(--surface)
        ${isOpen ? "border-[rgba(212,148,58,0.25)] shadow-md" : "border-(--border) hover:border-(--border-hover)"}`}
    >
      {/* Accordion Header Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left transition-colors hover:bg-(--surface2)/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          {/* Icon Badge */}
          <div className={`w-10 h-10 rounded-(--radius) border flex items-center justify-center transition-colors
            ${isOpen 
              ? "bg-(--amber-dim) border-[rgba(212,148,58,0.25)] text-(--amber)" 
              : "bg-(--surface2) border-(--border) text-(--text-muted)"
            }`}
          >
            <i className={`ti ${icon} text-lg`} aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-[14.5px] font-semibold text-(--text) tracking-wide">
              {title}
            </h3>
            <p className="text-[11.5px] text-(--text-dim) mt-0.5">
              Evaluation Matrix Weighting: **{weight}%**
            </p>
          </div>
        </div>

        {/* Chevron State Indicator */}
        <div className="text-(--text-dim) pr-1">
          <i 
            className={`ti ti-chevron-down text-lg transition-transform duration-300 block
              ${isOpen ? "rotate-180 text-(--amber)" : ""}`} 
            aria-hidden="true" 
          />
        </div>
      </button>

      {/* Expanded Details Body */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "max-h-200 border-t border-(--border)" : "max-h-0 pointer-events-none"}`}
      >
        <div className="p-5 space-y-5 bg-(--bg)/30 text-[13px]">
          {/* Overview Section */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted) mb-1.5">
              Objective Definition
            </h4>
            <p className="text-(--text-muted) leading-relaxed">
              {description}
            </p>
          </div>

          {/* Assessment Criteria List */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted) mb-2">
              Critical Assessment Vectors
            </h4>
            <ul className="space-y-2">
              {criteria.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-(--text-muted)">
                  <i className="ti ti-square-rounded-check text-(--amber) text-sm mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="leading-normal">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Dialogue Exemplars */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted) mb-2.5">
              Dialogue Calibration Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Avoid Panel */}
              <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-(--radius)">
                <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                  <i className="ti ti-circle-x" aria-hidden="true" /> Deductible (Avoid)
                </div>
                <p className="text-red-200/70 italic leading-relaxed font-sans">
                  "{exemplarDialogue.bad}"
                </p>
              </div>

              {/* Benchmark Panel */}
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-(--radius)">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                  <i className="ti ti-circle-check" aria-hidden="true" /> Benchmark Standard
                </div>
                <p className="text-emerald-200/70 italic leading-relaxed font-sans">
                  "{exemplarDialogue.good}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}