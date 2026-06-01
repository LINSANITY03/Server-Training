"use client";

interface LiveEvaluationProps {
  scores: {
    greeting: number | null;
    knowledge: number | null;
    upselling: number | null;
    empathy: number | null;
    standards: number | null;
  };
  overall: number | null;
  feedback?: string;
}

const CRITERIA = [
  { key: "greeting", label: "Greeting & Presence", icon: "ti-user-star" },
  { key: "knowledge", label: "Menu Knowledge", icon: "ti-book" },
  { key: "upselling", label: "Upselling", icon: "ti-trending-up" },
  { key: "empathy", label: "Empathy & Tone", icon: "ti-heart" },
  { key: "standards", label: "Standards Adherence", icon: "ti-checklist" },
] as const;

export default function LiveEvaluation({ scores, overall, feedback }: LiveEvaluationProps) {
  return (
    <aside className="w-64 border-l border-(--border) bg-(--surface) overflow-y-auto p-5 shrink-0">
      <h2 className="font-serif text-[15px] font-semibold mb-1">Live Evaluation</h2>
      <p className="text-[11.5px] text-(--text-muted) mb-6">Updated after each interaction</p>

      {/* Main Score Ring */}
      <div className="flex justify-center mb-6">
        <div className="text-center">
          <ScoreRing score={overall} />
          <p className="text-[11px] text-(--text-muted) mt-2 font-medium uppercase tracking-wider">Overall</p>
        </div>
      </div>

      {/* Detailed Progress Bars */}
      <div className="mb-6 space-y-4">
        {CRITERIA.map((c) => (
          <EvalBar 
            key={c.key} 
            label={c.label} 
            icon={c.icon} 
            value={scores[c.key as keyof typeof scores]} 
          />
        ))}
      </div>

      {/* Actionable Feedback */}
      {feedback && (
        <div className="bg-(--surface2) border border-(--border) rounded-(--radius) p-3 shadow-sm animate-fade-in">
          <p className="text-[11px] font-semibold text-(--amber) mb-1.5 flex items-center gap-1.5">
            <i className="ti ti-bulb text-sm" aria-hidden="true" /> Coaching Tip
          </p>
          <p className="text-xs text-(--text-muted) leading-relaxed">{feedback}</p>
        </div>
      )}
    </aside>
  );
}

// --- Sub-components (can be moved to /src/components/ui/) ---

function ScoreRing({ score }: { score: number | null }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = score == null ? 0 : (score / 100) * circ;
  const color = score == null ? "#555" : score >= 80 ? "var(--green)" : score >= 60 ? "var(--yellow)" : "var(--red)";
  
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-md">
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle 
        cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 40 40)" 
        className="transition-all duration-1000 ease-out" 
      />
      <text x="40" y="44" textAnchor="middle" fill={color} fontSize="16" fontWeight="600" className="font-sans">
        {score == null ? "—" : score}
      </text>
    </svg>
  );
}

function EvalBar({ label, icon, value }: { label: string; icon: string; value: number | null }) {
  const color = value == null ? "rgba(255,255,255,0.15)" : value >= 80 ? "var(--green)" : value >= 60 ? "var(--yellow)" : "var(--red)";
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="flex items-center gap-1.5 text-[12px] text-[rgba(255,255,255,0.6)]">
          <i className={`ti ${icon} text-[13px]`} aria-hidden="true" />
          {label}
        </span>
        <span className="text-[12px] font-semibold" style={{ color }}>
          {value == null ? "—" : `${value}%`}
        </span>
      </div>
      <div className="h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${value ?? 0}%`, backgroundColor: color }} 
        />
      </div>
    </div>
  );
}