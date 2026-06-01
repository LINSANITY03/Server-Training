"use client";

import { Scenario } from "@/lib/constant";

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selected: Scenario;
  onSelect: (scenario: Scenario) => void;
  onStart: () => void;
}

export default function ScenarioSelector({ scenarios, selected, onSelect, onStart }: ScenarioSelectorProps) {
  
  // Helper to map difficulty to our design system colors
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "var(--green)";
      case "Medium": return "var(--yellow)";
      case "Hard": return "var(--red)";
      default: return "var(--text)";
    }
  };

  return (
    <div className="p-8 border-b border-(--border) max-w-4xl mx-auto w-full animate-fade-in">
      <h1 className="font-serif text-2xl mb-1.5 font-semibold text-(--text)">
        Choose a Training Scenario
      </h1>
      <p className="text-[13.5px] text-(--text-muted) mb-6">
        Select a guest profile, then start the session to begin your live evaluation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {scenarios.map((s) => {
          const isSelected = selected.id === s.id;
          const diffColor = getDifficultyColor(s.difficulty);
          
          return (
            <button 
              key={s.id} 
              onClick={() => onSelect(s)}
              className={`
                text-left p-4 rounded-lg transition-all duration-200 border relative overflow-hidden group
                ${isSelected 
                  ? "bg-(--amber-dim) border-[rgba(212,148,58,0.35)] shadow-md transform scale-[1.01]" 
                  : "bg-(--surface2) border-(--border) hover:border-(--border-hover) hover:bg-(--surface3)"
                }
              `}
            >
              {/* Subtle active glow effect */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-(--amber) opacity-5 blur-3xl rounded-full" />
              )}

              <div className="flex justify-between items-start mb-2 relative z-10">
                <i 
                  className={`ti ${s.icon} text-2xl transition-colors ${isSelected ? "text-(--amber)" : "text-(--text-muted) group-hover:text-(--text)"}`} 
                  aria-hidden="true" 
                />
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                  style={{ 
                    color: diffColor, 
                    backgroundColor: `${diffColor}18`, 
                    borderColor: `${diffColor}30` 
                  }}
                >
                  {s.difficulty}
                </span>
              </div>
              
              <h3 className={`text-[13.5px] font-semibold mb-1 relative z-10 transition-colors ${isSelected ? "text-(--amber-light)" : "text-(--text)"}`}>
                {s.label}
              </h3>
              <p className="text-[11.5px] text-(--text-muted) leading-relaxed relative z-10 line-clamp-2">
                {s.desc}
              </p>
            </button>
          );
        })}
      </div>
      
      <button 
        onClick={onStart}
        className="w-full py-3.5 rounded-(--radius) bg-(--amber) text-[#1a0f00] font-bold text-sm tracking-wide shadow-lg shadow-[rgba(212,148,58,0.15)] hover:bg-(--amber-light) hover:shadow-[rgba(212,148,58,0.25)] transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
      >
        <i className="ti ti-player-play text-lg" aria-hidden="true" />
        Start Training Session
      </button>
    </div>
  );
}