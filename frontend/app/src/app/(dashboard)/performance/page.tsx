'use client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, CheckCircle, Circle } from 'lucide-react';
import { performanceMetrics, serviceSteps, dashboardStats } from '@/lib/mock-data';

const progressData = [
  { week: 'W1', score: 54 },
  { week: 'W2', score: 61 },
  { week: 'W3', score: 68 },
  { week: 'W4', score: 72 },
  { week: 'W5', score: 79 },
  { week: 'W6', score: 82 },
];

const radarData = performanceMetrics.map(m => ({
  category: m.category.split(' ')[0],
  score: m.score,
  fullMark: 100,
}));

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs"
        style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.3)', color: '#F0F5F0' }}>
        Score: <span style={{ color: '#4DB882' }}>{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export default function PerformancePage() {
  const overallScore = Math.round(performanceMetrics.reduce((sum, m) => sum + m.score, 0) / performanceMetrics.length);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F5F0' }}>Performance</h1>
        <p className="text-sm mt-1" style={{ color: '#6B8F7A' }}>Track your progress across all service competencies</p>
      </div>

      {/* Overall + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall score */}
        <div className="p-6 rounded-2xl flex flex-col items-center justify-center text-center"
          style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <div className="relative w-36 h-36 mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(45,122,79,0.2)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#2D7A4F" strokeWidth="10"
                strokeDasharray={`${(overallScore / 100) * 314} 314`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: '#4DB882' }}>{overallScore}%</span>
              <span className="text-xs" style={{ color: '#6B8F7A' }}>Overall</span>
            </div>
          </div>
          <h2 className="font-bold text-lg" style={{ color: '#F0F5F0' }}>Overall Score</h2>
          <p className="text-xs mt-1" style={{ color: '#6B8F7A' }}>Based on {dashboardStats.totalSessions} sessions</p>
          <div className="flex items-center gap-1.5 mt-3 text-sm" style={{ color: '#4DB882' }}>
            <TrendingUp className="w-4 h-4" />+6% this month
          </div>
        </div>

        {/* Radar */}
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F0F5F0' }}>Competency Map</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(45,122,79,0.2)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#6B8F7A', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#2D7A4F" fill="#2D7A4F" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress over time */}
      <div className="p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
        <h3 className="font-semibold mb-6" style={{ color: '#F0F5F0' }}>Score Progression</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,122,79,0.1)" />
            <XAxis dataKey="week" tick={{ fill: '#6B8F7A', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B8F7A', fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="score" stroke="#2D7A4F" strokeWidth={2.5} dot={{ fill: '#4DB882', r: 4 }} activeDot={{ r: 6, fill: '#4DB882' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Service flow steps */}
      <div className="p-6 rounded-2xl" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#F0F5F0' }}>Service Flow Mastery</h3>
        <p className="text-xs mb-6" style={{ color: '#6B8F7A' }}>How consistently you follow the correct service sequence</p>
        <div className="relative">
          <div className="absolute top-5 left-5 right-5 h-0.5" style={{ background: 'rgba(45,122,79,0.2)' }} />
          <div className="flex justify-between relative">
            {serviceSteps.map((step, i) => (
              <div key={step.step} className="flex flex-col items-center gap-2" style={{ width: `${100 / serviceSteps.length}%` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 relative transition-all"
                  style={{
                    background: step.completed ? 'linear-gradient(135deg, #2D7A4F, #38966A)' : '#1A3A2A',
                    border: step.completed ? 'none' : '2px solid rgba(45,122,79,0.3)',
                  }}>
                  {step.completed
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Circle className="w-5 h-5" style={{ color: '#3A5A45' }} />}
                </div>
                <span className="text-xs text-center leading-tight" style={{ color: step.completed ? '#A8E0C1' : '#3A5A45' }}>
                  {step.name}
                </span>
                <span className="text-xs font-mono" style={{ color: step.completed ? '#4DB882' : '#3A5A45' }}>
                  {step.completed ? '✓' : `${step.step}`}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-5 h-0.5 transition-all duration-1000"
            style={{
              width: `${(serviceSteps.filter(s => s.completed).length / serviceSteps.length) * 90}%`,
              background: 'linear-gradient(90deg, #2D7A4F, #4DB882)',
            }} />
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: '#6B8F7A' }}>
          <span style={{ color: '#4DB882' }}>{serviceSteps.filter(s => s.completed).length}</span>
          <span>of {serviceSteps.length} steps mastered in latest session</span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceMetrics.map(metric => {
          const trendIcon = metric.trend > 0
            ? <TrendingUp className="w-3.5 h-3.5" />
            : metric.trend < 0
              ? <TrendingDown className="w-3.5 h-3.5" />
              : <Minus className="w-3.5 h-3.5" />;
          const trendColor = metric.trend > 0 ? '#4DB882' : metric.trend < 0 ? '#F87171' : '#6B8F7A';

          return (
            <div key={metric.category} className="p-5 rounded-2xl"
              style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold" style={{ color: '#F0F5F0' }}>{metric.category}</h4>
                <div className="flex items-center gap-1 text-xs" style={{ color: trendColor }}>
                  {trendIcon}
                  {metric.trend !== 0 ? `${metric.trend > 0 ? '+' : ''}${metric.trend}%` : 'Stable'}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(45,122,79,0.15)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${metric.score}%`,
                      background: metric.score >= 80 ? 'linear-gradient(90deg, #2D7A4F, #4DB882)'
                        : metric.score >= 60 ? 'linear-gradient(90deg, #D97706, #FBBF24)'
                          : 'linear-gradient(90deg, #B91C1C, #F87171)',
                    }} />
                </div>
                <span className="text-sm font-bold w-10 text-right"
                  style={{ color: metric.score >= 80 ? '#4DB882' : metric.score >= 60 ? '#FBBF24' : '#F87171' }}>
                  {metric.score}%
                </span>
              </div>

              <ul className="space-y-1">
                {metric.details.map(detail => (
                  <li key={detail} className="flex items-start gap-2 text-xs" style={{ color: '#6B8F7A' }}>
                    <span style={{ color: '#2D7A4F', flexShrink: 0 }}>›</span>{detail}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
