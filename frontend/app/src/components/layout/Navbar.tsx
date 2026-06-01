"use client";

interface NavbarProps {
  title: string | undefined;
  isActive: boolean;
  time: number;
}

export default function Navbar({ title, isActive, time }: NavbarProps) {
  
  // Format seconds into MM:SS display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="h-16 border-b border-(--border) bg-(--bg) px-6 flex items-center justify-between shrink-0 z-20">
      {/* View Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-(--text-dim) uppercase tracking-wider font-semibold">Workspace</span>
        <span className="text-xs text-(--text-dim)">/</span>
        <h1 className="font-serif text-[15px] font-semibold tracking-wide text-(--text)">
          {title || "Dashboard"}
        </h1>
      </div>

      {/* Right Actions & Session Diagnostics */}
      <div className="flex items-center gap-4">
        {/* Active Timer UX status */}
        {isActive && (
          <div className="flex items-center gap-3 px-3 py-1.5 bg-(--surface2) border border-(--border) rounded-full animate-fade-in shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Session
            </span>
            <div className="w-px h-3 bg-(--border)" />
            <span className="text-xs font-mono font-medium text-(--text-muted) tracking-tabular">
              {formatTime(time)}
            </span>
          </div>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-semibold leading-tight">Adam</p>
            <p className="text-[10px] text-(--text-dim) leading-tight">Trainee</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-(--surface3) border border-(--border) flex items-center justify-center text-sm font-semibold shadow-sm text-(--text-muted)">
            A
          </div>
        </div>
      </div>
    </header>
  );
}