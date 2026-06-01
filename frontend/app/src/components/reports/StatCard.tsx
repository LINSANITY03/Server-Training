"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ label, value, icon, description, trend }: StatCardProps) {
  return (
    <article className="p-5 bg-(--surface) border border-(--border) rounded-lg shadow-sm relative overflow-hidden group">
      {/* Background soft lighting accent */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-(--amber-dim) opacity-0 group-hover:opacity-40 blur-2xl rounded-full transition-opacity duration-300" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <span className="text-[12px] text-(--text-muted) font-medium tracking-wide">
          {label}
        </span>
        <div className="w-8 h-8 rounded-(--radius) bg-(--surface2) border border-(--border) flex items-center justify-center text-(--text-muted) group-hover:text-(--amber) group-hover:border-[rgba(212,148,58,0.2)] transition-colors">
          <i className={`ti ${icon} text-base`} aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-baseline gap-2.5 mb-1 relative z-10">
        <span className="font-serif text-2xl font-semibold tracking-wide">
          {value}
        </span>
        
        {/* Metric Trend Badge */}
        {trend && (
          <span 
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5
              ${trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
          >
            <i className={`ti ${trend.isPositive ? "ti-arrow-up-right" : "ti-arrow-down-left"}`} aria-hidden="true" />
            {trend.value}%
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-(--text-dim) relative z-10 leading-normal">
          {description}
        </p>
      )}
    </article>
  );
}