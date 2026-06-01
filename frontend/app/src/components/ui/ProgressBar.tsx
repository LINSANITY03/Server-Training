"use client";

interface ProgressBarProps {
  label: string;
  value: number | null;
  icon?: string;
}

export default function ProgressBar({ label, value, icon }: ProgressBarProps) {
  // Pick structural semantic thresholds for color mapping
  const getColor = (val: number | null) => {
    if (val == null) return "rgba(255,255,255,0.15)";
    if (val >= 80) return "var(--green)";
    if (val >= 60) return "var(--yellow)";
    return "var(--red)";
  };

  const currentColor = getColor(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-[12px]">
        <span className="flex items-center gap-1.5 text-[rgba(255,255,255,0.6)]">
          {icon && <i className={`ti ${icon} text-[13px]`} aria-hidden="true" />}
          {label}
        </span>
        <span className="font-semibold transition-colors duration-500" style={{ color: currentColor }}>
          {value == null ? "—" : `${value}%`}
        </span>
      </div>
      
      {/* Track Base */}
      <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        {/* Active Fill with continuous CSS animation slide */}
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${value ?? 0}%`, 
            backgroundColor: currentColor 
          }} 
        />
      </div>
    </div>
  );
}