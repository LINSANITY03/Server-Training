'use client';
import { useState, useRef } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Info, Star, Trophy, BookOpen, Filter } from 'lucide-react';
import { servicePhases, getTotalWeight, getPhaseProgress } from '@/lib/service-steps';

type ViewMode = 'journey' | 'checklist' | 'reference';

const WEIGHT_LABEL = (w: number) => {
  if (w === 0) return { label: 'Observation', color: '#6B8F7A', bg: 'rgba(107,143,122,0.15)' };
  if (w >= 20) return { label: 'Critical', color: '#F87171', bg: 'rgba(248,113,113,0.15)' };
  if (w >= 10) return { label: 'Important', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' };
  return { label: 'Standard', color: '#72CC9E', bg: 'rgba(114,204,158,0.15)' };
};

export default function ServiceStepsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('journey');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<string[]>(servicePhases.map(p => p.id));
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [filterWeight, setFilterWeight] = useState<'all' | 'critical' | 'important'>('all');
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalSteps = servicePhases.flatMap(p => p.steps).length;
  const scorableSteps = servicePhases.flatMap(p => p.steps).filter(s => s.weight > 0);
  const completedScorable = scorableSteps.filter(s => completedIds.includes(s.id));
  const totalWeight = getTotalWeight();
  const earnedWeight = completedScorable.reduce((sum, s) => sum + s.weight, 0);
  const overallPct = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  const filteredPhases = servicePhases.map(phase => ({
    ...phase,
    steps: phase.steps.filter(s => {
      if (filterWeight === 'critical') return s.weight >= 20;
      if (filterWeight === 'important') return s.weight >= 10;
      return true;
    }),
  })).filter(p => p.steps.length > 0);

  const scrollToPhase = (id: string) => {
    setActivePhaseId(id);
    setExpandedPhases(prev => prev.includes(id) ? prev : [...prev, id]);
    setTimeout(() => phaseRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0D1F15' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-8 py-5 border-b"
        style={{ background: 'rgba(13,31,21,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(45,122,79,0.2)' }}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5" style={{ color: '#4DB882' }} />
              <h1 className="text-xl font-bold" style={{ color: '#F0F5F0' }}>Steps of Service</h1>
              <span className="text-xs px-2 py-0.5 rounded-full ml-1"
                style={{ background: 'rgba(45,122,79,0.2)', color: '#4DB882' }}>
                Dishoom Standard
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6B8F7A' }}>
              {totalSteps} steps across {servicePhases.length} phases · {totalWeight} total points
            </p>
          </div>

          {/* View toggles */}
          <div className="flex items-center gap-2">
            {(['journey', 'checklist', 'reference'] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: viewMode === mode ? 'linear-gradient(135deg, #2D7A4F, #38966A)' : 'rgba(45,122,79,0.1)',
                  color: viewMode === mode ? '#F0F5F0' : '#6B8F7A',
                  border: viewMode === mode ? 'none' : '1px solid rgba(45,122,79,0.2)',
                }}>
                {mode === 'journey' ? '🗺 Journey' : mode === 'checklist' ? '✅ Checklist' : '📖 Reference'}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar (checklist mode) */}
        {viewMode === 'checklist' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: '#6B8F7A' }}>
                {completedScorable.length} of {scorableSteps.length} steps completed
              </span>
              <span className="text-sm font-bold" style={{ color: overallPct >= 80 ? '#4DB882' : overallPct >= 60 ? '#FBBF24' : '#F87171' }}>
                {overallPct}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(45,122,79,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallPct}%`,
                  background: overallPct >= 80
                    ? 'linear-gradient(90deg, #2D7A4F, #4DB882)'
                    : overallPct >= 60
                      ? 'linear-gradient(90deg, #D97706, #FBBF24)'
                      : 'linear-gradient(90deg, #B91C1C, #F87171)',
                }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar phase nav (journey + reference mode) */}
        {viewMode !== 'checklist' && (
          <aside className="hidden xl:flex flex-col w-56 sticky top-[89px] h-[calc(100vh-89px)] p-4 gap-1 overflow-y-auto border-r"
            style={{ borderColor: 'rgba(45,122,79,0.15)' }}>
            {servicePhases.map((phase, i) => {
              const phasePct = getPhaseProgress(phase.id, completedIds);
              return (
                <button key={phase.id} onClick={() => scrollToPhase(phase.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group"
                  style={{
                    background: activePhaseId === phase.id ? 'rgba(45,122,79,0.2)' : 'transparent',
                    border: activePhaseId === phase.id ? '1px solid rgba(45,122,79,0.3)' : '1px solid transparent',
                  }}>
                  <span className="text-base leading-none">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: activePhaseId === phase.id ? '#A8E0C1' : '#6B8F7A' }}>
                      {phase.label}
                    </p>
                    <p className="text-xs" style={{ color: '#3A5A45' }}>{phase.steps.length} steps</p>
                  </div>
                  <span className="text-xs font-mono w-8 text-right" style={{ color: phase.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 p-6 lg:p-8 space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-4 h-4 flex-shrink-0" style={{ color: '#6B8F7A' }} />
            <span className="text-xs" style={{ color: '#6B8F7A' }}>Show:</span>
            {([['all', 'All steps'], ['critical', '🔴 Critical only (20pts)'], ['important', '🟡 Important+ (10pts)']] as [typeof filterWeight, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setFilterWeight(val)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filterWeight === val ? 'rgba(45,122,79,0.25)' : 'rgba(45,122,79,0.08)',
                  color: filterWeight === val ? '#A8E0C1' : '#6B8F7A',
                  border: filterWeight === val ? '1px solid rgba(45,122,79,0.4)' : '1px solid rgba(45,122,79,0.15)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* JOURNEY VIEW */}
          {viewMode === 'journey' && (
            <div className="space-y-3">
              {filteredPhases.map((phase, phaseIndex) => {
                const isExpanded = expandedPhases.includes(phase.id);
                const phaseCompleted = phase.steps.filter(s => completedIds.includes(s.id)).length;

                return (
                  <div key={phase.id} ref={el => { phaseRefs.current[phase.id] = el; }}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{ background: '#1A3A2A', border: `1px solid rgba(45,122,79,0.2)` }}>
                    {/* Phase header */}
                    <button onClick={() => togglePhase(phase.id)}
                      className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
                      style={{ background: isExpanded ? 'rgba(45,122,79,0.08)' : 'transparent' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${phase.color}20`, border: `1px solid ${phase.color}40` }}>
                        {phase.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono" style={{ color: phase.color }}>
                            PHASE {String(phaseIndex + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="font-bold text-base mt-0.5" style={{ color: '#F0F5F0' }}>{phase.label}</h3>
                        <p className="text-xs mt-0.5" style={{ color: '#6B8F7A' }}>
                          {phase.steps.length} steps · {phase.steps.reduce((s, x) => s + x.weight, 0)} points
                        </p>
                      </div>
                      {isExpanded
                        ? <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#6B8F7A' }} />
                        : <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#6B8F7A' }} />}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 space-y-2 border-t" style={{ borderColor: 'rgba(45,122,79,0.15)' }}>
                        <div className="pt-4 space-y-2">
                          {phase.steps.map((step, stepIdx) => {
                            const wCfg = WEIGHT_LABEL(step.weight);
                            const isExpStep = expandedSteps.includes(step.id);
                            const isLast = stepIdx === phase.steps.length - 1;

                            return (
                              <div key={step.id} className="relative pl-8">
                                {/* Connector line */}
                                {!isLast && (
                                  <div className="absolute left-3.5 top-8 w-px h-full"
                                    style={{ background: 'rgba(45,122,79,0.2)' }} />
                                )}
                                {/* Step dot */}
                                <div className="absolute left-0 top-3 w-7 h-7 rounded-full flex items-center justify-center z-10"
                                  style={{
                                    background: '#0D1F15',
                                    border: `2px solid ${step.weight >= 20 ? '#F87171' : step.weight >= 10 ? '#FBBF24' : step.weight > 0 ? '#2D7A4F' : '#3A5A45'}`,
                                  }}>
                                  <span className="text-xs font-mono font-bold"
                                    style={{ color: step.weight >= 20 ? '#F87171' : step.weight >= 10 ? '#FBBF24' : step.weight > 0 ? '#4DB882' : '#3A5A45', fontSize: '9px' }}>
                                    {step.weight > 0 ? step.weight : '—'}
                                  </span>
                                </div>

                                {/* Step card */}
                                <div className="rounded-xl overflow-hidden transition-all"
                                  style={{ background: '#0D1F15', border: '1px solid rgba(45,122,79,0.15)' }}>
                                  <button onClick={() => toggleStep(step.id)}
                                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-mono" style={{ color: '#3A5A45' }}>{step.code}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                          style={{ background: wCfg.bg, color: wCfg.color }}>
                                          {wCfg.label}
                                        </span>
                                        {step.weight >= 20 && <Star className="w-3 h-3" style={{ color: '#F87171' }} />}
                                      </div>
                                      <p className="text-sm font-medium mt-1" style={{ color: '#F0F5F0' }}>{step.criteria}</p>
                                    </div>
                                    <Info className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: isExpStep ? '#4DB882' : '#3A5A45' }} />
                                  </button>

                                  {isExpStep && step.tip && (
                                    <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(45,122,79,0.1)' }}>
                                      <div className="mt-3 p-3 rounded-xl flex gap-2.5"
                                        style={{ background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.2)' }}>
                                        <span className="text-base">💡</span>
                                        <p className="text-xs leading-relaxed" style={{ color: '#A8E0C1' }}>{step.tip}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CHECKLIST VIEW */}
          {viewMode === 'checklist' && (
            <div className="space-y-6">
              {/* Score summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Score', value: `${overallPct}%`, color: overallPct >= 80 ? '#4DB882' : overallPct >= 60 ? '#FBBF24' : '#F87171' },
                  { label: 'Points earned', value: `${earnedWeight}/${totalWeight}`, color: '#A8E0C1' },
                  { label: 'Steps done', value: `${completedScorable.length}/${scorableSteps.length}`, color: '#A8E0C1' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-xl text-center"
                    style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
                    <div className="text-xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-xs mt-1" style={{ color: '#6B8F7A' }}>{label}</div>
                  </div>
                ))}
              </div>

              {filteredPhases.map(phase => {
                const phaseScore = getPhaseProgress(phase.id, completedIds);
                return (
                  <div key={phase.id} className="rounded-2xl overflow-hidden"
                    style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
                    {/* Phase header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between"
                      style={{ borderColor: 'rgba(45,122,79,0.15)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{phase.icon}</span>
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: '#F0F5F0' }}>{phase.label}</h3>
                          <p className="text-xs" style={{ color: '#6B8F7A' }}>{phase.steps.length} steps</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(45,122,79,0.2)' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${phaseScore}%`, background: phase.color }} />
                        </div>
                        <span className="text-sm font-bold w-10 text-right" style={{ color: phase.color }}>{phaseScore}%</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="divide-y" style={{ borderColor: 'rgba(45,122,79,0.08)' }}>
                      {phase.steps.map(step => {
                        const done = completedIds.includes(step.id);
                        const wCfg = WEIGHT_LABEL(step.weight);
                        return (
                          <button key={step.id} onClick={() => toggleComplete(step.id)}
                            className="w-full flex items-center gap-4 px-6 py-3.5 text-left transition-all group"
                            style={{ background: done ? 'rgba(45,122,79,0.06)' : 'transparent' }}>
                            <div className="flex-shrink-0">
                              {done
                                ? <CheckCircle2 className="w-5 h-5" style={{ color: '#4DB882' }} />
                                : <Circle className="w-5 h-5" style={{ color: '#3A5A45' }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm" style={{ color: done ? '#6B8F7A' : '#F0F5F0', textDecoration: done ? 'line-through' : 'none' }}>
                                {step.criteria}
                              </p>
                              <span className="text-xs" style={{ color: '#3A5A45' }}>{step.code}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: wCfg.bg, color: wCfg.color }}>
                                {step.weight > 0 ? `${step.weight}pts` : 'obs.'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {completedScorable.length === scorableSteps.length && scorableSteps.length > 0 && (
                <div className="p-6 rounded-2xl text-center"
                  style={{ background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.3)' }}>
                  <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: '#4DB882' }} />
                  <h3 className="font-bold text-lg" style={{ color: '#F0F5F0' }}>Full service completed!</h3>
                  <p className="text-sm mt-1" style={{ color: '#6B8F7A' }}>Final score: {overallPct}%</p>
                </div>
              )}
            </div>
          )}

          {/* REFERENCE VIEW */}
          {viewMode === 'reference' && (
            <div className="space-y-3">
              {filteredPhases.map(phase => (
                <div key={phase.id} ref={el => { phaseRefs.current[phase.id] = el; }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
                  {/* Phase header */}
                  <div className="px-6 py-4 border-b flex items-center gap-3"
                    style={{ borderColor: 'rgba(45,122,79,0.15)', background: `${phase.color}12` }}>
                    <span className="text-xl">{phase.icon}</span>
                    <h3 className="font-bold" style={{ color: '#F0F5F0' }}>{phase.label}</h3>
                    <span className="text-xs ml-auto" style={{ color: phase.color }}>
                      {phase.steps.reduce((s, x) => s + x.weight, 0)}pts total
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(45,122,79,0.1)' }}>
                          <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#6B8F7A' }}>Code</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#6B8F7A' }}>Criteria</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#6B8F7A' }}>Weight</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#6B8F7A' }}>Type</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#6B8F7A' }}>Tip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phase.steps.map((step, i) => {
                          const wCfg = WEIGHT_LABEL(step.weight);
                          return (
                            <tr key={step.id} style={{ borderBottom: i < phase.steps.length - 1 ? '1px solid rgba(45,122,79,0.08)' : 'none' }}>
                              <td className="px-6 py-3 font-mono text-xs" style={{ color: '#3A5A45' }}>{step.code}</td>
                              <td className="px-6 py-3" style={{ color: '#F0F5F0' }}>{step.criteria}</td>
                              <td className="px-6 py-3">
                                <span className="font-bold text-sm" style={{ color: step.weight >= 20 ? '#F87171' : step.weight >= 10 ? '#FBBF24' : step.weight > 0 ? '#4DB882' : '#3A5A45' }}>
                                  {step.weight > 0 ? `${step.weight}` : '—'}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: wCfg.bg, color: wCfg.color }}>
                                  {wCfg.label}
                                </span>
                              </td>
                              <td className="px-6 py-3 max-w-xs">
                                <p className="text-xs leading-relaxed" style={{ color: '#6B8F7A' }}>{step.tip}</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}