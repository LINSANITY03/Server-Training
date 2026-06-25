'use client';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  PlayCircle, PauseCircle, CheckCircle2, XCircle,
  TrendingUp, Plus, ArrowRight, Clock, Users
} from 'lucide-react';
import { mockSessions, dashboardStats, formatRelativeTime } from '@/lib/mock-data';
import type { SessionStatus } from '@/types';

const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ongoing: { label: 'Ongoing', color: '#4DB882', bg: 'rgba(77,184,130,0.15)', icon: PlayCircle },
  paused: { label: 'Paused', color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', icon: PauseCircle },
  completed: { label: 'Completed', color: '#38966A', bg: 'rgba(56,150,106,0.15)', icon: CheckCircle2 },
  failed: { label: 'Failed', color: '#F87171', bg: 'rgba(248,113,113,0.15)', icon: XCircle },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.3)', color: '#F0F5F0' }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.name === 'sessions' ? '#4DB882' : '#72CC9E' }}>
            {p.name === 'sessions' ? 'Total' : 'Success'}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { totalSessions, successSessions, failedSessions, ongoingSessions, pausedSessions, averageScore, weeklyData } = dashboardStats;
  const resumableSessions = mockSessions.filter(s => s.status === 'ongoing' || s.status === 'paused');
  const recentCompleted = mockSessions.filter(s => s.status === 'completed' || s.status === 'failed');

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F5F0' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#6B8F7A' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/chat"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)', color: '#F0F5F0' }}>
          <Plus className="w-4 h-4" /> New Session
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Sessions', value: totalSessions, icon: TrendingUp, color: '#4DB882', sub: 'all time' },
          { label: 'Successful', value: successSessions, icon: CheckCircle2, color: '#38966A', sub: `${Math.round(successSessions/totalSessions*100)}% rate` },
          { label: 'Failed', value: failedSessions, icon: XCircle, color: '#F87171', sub: `${Math.round(failedSessions/totalSessions*100)}% rate` },
          { label: 'Active', value: ongoingSessions + pausedSessions, icon: PlayCircle, color: '#FBBF24', sub: `${pausedSessions} paused` },
          { label: 'Avg Score', value: `${averageScore}%`, icon: TrendingUp, color: '#A78BFA', sub: '+4 this week' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#6B8F7A' }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#F0F5F0' }}>{value}</div>
            <div className="text-xs mt-1" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold" style={{ color: '#F0F5F0' }}>Weekly Activity</h2>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(45,122,79,0.2)', color: '#4DB882' }}>This week</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: '#6B8F7A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B8F7A', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" fill="rgba(45,122,79,0.4)" radius={[4, 4, 0, 0]} name="sessions" />
              <Bar dataKey="success" fill="#2D7A4F" radius={[4, 4, 0, 0]} name="success" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resume sessions */}
        <div className="p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#F0F5F0' }}>In Progress</h2>
            <span className="text-xs" style={{ color: '#6B8F7A' }}>{resumableSessions.length} active</span>
          </div>
          <div className="space-y-3">
            {resumableSessions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm" style={{ color: '#6B8F7A' }}>No active sessions</p>
                <Link href="/chat" className="text-xs mt-2 inline-block" style={{ color: '#4DB882' }}>Start one →</Link>
              </div>
            ) : resumableSessions.map(session => {
              const cfg = statusConfig[session.status];
              const Icon = cfg.icon;
              return (
                <div key={session.id} className="p-4 rounded-xl" style={{ background: '#0D1F15', border: `1px solid ${cfg.color}30` }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium leading-snug" style={{ color: '#F0F5F0' }}>{session.scenario}</p>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: '#6B8F7A' }}>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{session.guestCount} guests</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(session.startTime)}</span>
                  </div>
                  <Link href={`/chat/session?id=${session.id}`}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: '#4DB882' }}>
                    Resume session <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(45,122,79,0.2)' }}>
          <h2 className="font-semibold" style={{ color: '#F0F5F0' }}>Recent Sessions</h2>
          <Link href="/performance" className="text-xs" style={{ color: '#4DB882' }}>View all →</Link>
        </div>
        <div className="divide-y divide-forest-800">
          {recentCompleted.map(session => {
            const cfg = statusConfig[session.status];
            const Icon = cfg.icon;
            return (
              <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#F0F5F0' }}>{session.scenario}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B8F7A' }}>
                      {session.guestCount} guests · {session.diningType} · {formatRelativeTime(session.startTime)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {session.score !== undefined && (
                    <div className="text-lg font-bold" style={{ color: session.score >= 70 ? '#4DB882' : '#F87171' }}>
                      {session.score}%
                    </div>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
