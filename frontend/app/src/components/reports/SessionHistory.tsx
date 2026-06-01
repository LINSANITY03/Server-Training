"use client";

interface SessionRecord {
  id: string | number;
  scenario: string;
  score: number;
  time: number; // Duration in total seconds
  date: string;
}

interface SessionHistoryProps {
  history: SessionRecord[];
}

export default function SessionHistory({ history }: SessionHistoryProps) {
  
  // Format cumulative seconds dynamically to human reading bounds
  const formatDuration = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Assign qualitative semantic styling tags directly to scoring spectrum bounds
  const getScoreStyle = (score: number) => {
    if (score >= 85) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 70) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
      <div className="p-5 border-b border-[var(--border)]">
        <h2 className="font-serif text-[15px] font-semibold tracking-wide">Session Logs</h2>
        <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">Historical verification of past scenario workflows</p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center text-[var(--text-dim)] flex flex-col items-center justify-center">
          <i className="ti ti-history text-3xl mb-2 opacity-40" aria-hidden="true" />
          <p className="text-xs">No simulation iterations discovered in this profile matrix yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[var(--surface2)] border-b border-[var(--border)] text-[var(--text-muted)] font-medium text-[11.5px] uppercase tracking-wider">
                <th className="py-3.5 px-5">Scenario Objective</th>
                <th className="py-3.5 px-5">Completion Date</th>
                <th className="py-3.5 px-5">Floor Duration</th>
                <th className="py-3.5 px-5 text-right">Performance Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-sans">
              {history.map((session) => {
                const badge = getScoreStyle(session.score);
                return (
                  <tr key={session.id} className="hover:bg-[var(--surface2)]/50 transition-colors group">
                    <td className="py-4 px-5 font-medium text-[var(--text)] group-hover:text-[var(--amber-light)] transition-colors">
                      {session.scenario}
                    </td>
                    <td className="py-4 px-5 text-[var(--text-muted)]">
                      {session.date}
                    </td>
                    <td className="py-4 px-5 text-[var(--text-muted)] font-mono text-[12px]">
                      {formatDuration(session.time)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className={`inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border ${badge.text} ${badge.bg} ${badge.border}`}>
                        {session.score}/100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}