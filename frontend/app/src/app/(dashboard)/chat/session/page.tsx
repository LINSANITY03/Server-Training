'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock, X, Pause, Play, Send, AlertTriangle,
  ChefHat, Zap, Coffee, Timer, UtensilsCrossed
} from 'lucide-react';
import { formatDuration } from '@/lib/mock-data';
import type { Message, SessionEvent } from '@/types';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'guest',
    content: 'Good evening! We have a reservation under Thompson, party of four.',
    timestamp: new Date(),
    guestName: 'Guest 1 (Thompson)',
  },
];

const EVENT_OPTIONS = [
  { type: 'food_delayed' as const, label: 'Food Delayed', icon: Timer, severity: 'medium' as const },
  { type: 'drinks_delayed' as const, label: 'Drinks Delayed', icon: Coffee, severity: 'low' as const },
  { type: 'allergen_served' as const, label: 'Allergen Served', icon: AlertTriangle, severity: 'high' as const },
  { type: 'complaint' as const, label: 'Guest Complaint', icon: UtensilsCrossed, severity: 'high' as const },
];

const LOADING_PHRASES = [
  'Initialising scenario...',
  'Loading guest profiles...',
  'Preparing dining environment...',
  'AI guests are ready...',
];

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const scenario = params.get('scenario') || 'Fine Dining Evening Service';
  const guests = params.get('guests') || '4';
  const isNew = params.get('new') === '1';

  const [loading, setLoading] = useState(isNew);
  const [loadPhase, setLoadPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Loading sequence
  useEffect(() => {
    const phases = [800, 1400, 2000, 2600, 3200];
    const timeouts = phases.map((delay, i) =>
      setTimeout(() => {
        setLoadPhase(i);
        if (i === phases.length - 1) setTimeout(() => setLoading(false), 500);
      }, delay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [isNew]);

  // Timer
  useEffect(() => {
    if (!loading && !paused && !terminated) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, paused, terminated]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim() || paused) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Call Anthropic API
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: `You are roleplaying as a realistic restaurant guest in a hospitality training simulation. Scenario: ${scenario}. Party size: ${guests} guests. 
          Respond as a guest would — with natural conversation, occasional requests, questions about the menu, or mild complaints. 
          Keep responses short (1-3 sentences). Vary between being satisfied, curious, or mildly demanding. 
          Occasionally bring up dietary needs or service issues to test the trainee.`,
          messages: [
            ...messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'user',
              content: m.role === 'user'
                ? `[SERVER]: ${m.content}`
                : `[GUEST ${m.guestName || ''}]: ${m.content}`
            })),
            { role: 'user', content: `[SERVER]: ${input.trim()}` }
          ],
        }),
      });

      const data = await response.json();
      const replyText = data.content?.[0]?.text || 'Hmm, interesting. Could you tell us more about the menu?';

      setTyping(false);
      const guestMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'guest',
        content: replyText,
        timestamp: new Date(),
        guestName: 'Guest (Thompson)',
      };
      setMessages(prev => [...prev, guestMsg]);
    } catch {
      setTyping(false);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'guest',
        content: 'We\'d like to hear the specials for tonight, please.',
        timestamp: new Date(),
        guestName: 'Guest (Thompson)',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const triggerEvent = (eventType: typeof EVENT_OPTIONS[0]) => {
    const newEvent: SessionEvent = {
      id: crypto.randomUUID(),
      type: eventType.type,
      label: eventType.label,
      timestamp: new Date(),
      severity: eventType.severity,
    };
    setEvents(prev => [newEvent, ...prev]);

    // Add as system message
    const eventMsg: Message = {
      id: crypto.randomUUID(),
      role: 'guest',
      content: eventType.type === 'food_delayed'
        ? 'Excuse me, we\'ve been waiting quite a while. Where are our main courses?'
        : eventType.type === 'drinks_delayed'
          ? 'We ordered drinks nearly 15 minutes ago. Could you please check on them?'
          : eventType.type === 'allergen_served'
            ? 'Wait — does this dish contain nuts? I specifically mentioned my allergy!'
            : 'I need to speak to a manager. This is not acceptable.',
      timestamp: new Date(),
      guestName: '⚠ Event: ' + eventType.label,
    };
    setMessages(prev => [...prev, eventMsg]);
    setShowEventPanel(false);
  };

  const handleTerminate = () => {
    setTerminated(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A3A2A, #2D7A4F)' }}>
            <Zap className="w-10 h-10" style={{ color: '#4DB882' }} />
          </div>
          <div className="absolute inset-0 rounded-2xl pulse-ring" style={{ border: '2px solid #2D7A4F' }} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold" style={{ color: '#F0F5F0' }}>Preparing your session</h2>
          <p className="text-sm" style={{ color: '#4DB882' }}>{LOADING_PHRASES[Math.min(loadPhase, LOADING_PHRASES.length - 1)]}</p>
        </div>
        <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(45,122,79,0.2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${((loadPhase + 1) / LOADING_PHRASES.length) * 100}%`,
            background: 'linear-gradient(90deg, #2D7A4F, #4DB882)',
          }} />
        </div>
      </div>
    );
  }

  if (terminated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <X className="w-8 h-8" style={{ color: '#F87171' }} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0F5F0' }}>Session Terminated</h2>
          <p className="text-sm" style={{ color: '#6B8F7A' }}>Duration: {formatDuration(elapsed)}</p>
        </div>
        <div className="p-6 rounded-2xl w-full max-w-md" style={{ background: '#1A3A2A', border: '1px solid rgba(45,122,79,0.2)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F0F5F0' }}>Session Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: '#6B8F7A' }}>Messages</span><span style={{ color: '#F0F5F0' }}>{messages.length}</span></div>
            <div className="flex justify-between"><span style={{ color: '#6B8F7A' }}>Events handled</span><span style={{ color: '#F0F5F0' }}>{events.length}</span></div>
            <div className="flex justify-between"><span style={{ color: '#6B8F7A' }}>Duration</span><span style={{ color: '#F0F5F0' }}>{formatDuration(elapsed)}</span></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/chat')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)', color: '#F0F5F0' }}>
            New Session
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(45,122,79,0.2)', color: '#A8E0C1' }}>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#1A3A2A', borderColor: 'rgba(45,122,79,0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(45,122,79,0.3)' }}>
            <ChefHat className="w-5 h-5" style={{ color: '#4DB882' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#F0F5F0' }}>{scenario}</p>
            <p className="text-xs" style={{ color: '#6B8F7A' }}>{guests} guests · Text session</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(45,122,79,0.15)', border: '1px solid rgba(45,122,79,0.25)' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: paused ? '#FBBF24' : '#4DB882' }} />
            <span className="text-sm font-mono font-bold" style={{ color: paused ? '#FBBF24' : '#4DB882' }}>
              {formatDuration(elapsed)}
            </span>
          </div>

          {/* Event trigger */}
          <div className="relative">
            <button onClick={() => setShowEventPanel(!showEventPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#FBBF24' }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Event
            </button>
            {showEventPanel && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 shadow-xl"
                style={{ background: '#1F4733', border: '1px solid rgba(45,122,79,0.3)' }}>
                {EVENT_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.type} onClick={() => triggerEvent(opt)}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left transition-colors hover:bg-forest-800"
                      style={{ color: opt.severity === 'high' ? '#F87171' : opt.severity === 'medium' ? '#FBBF24' : '#A8E0C1' }}>
                      <Icon className="w-4 h-4" />{opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pause */}
          <button onClick={() => setPaused(!paused)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(45,122,79,0.15)', border: '1px solid rgba(45,122,79,0.25)', color: '#A8E0C1' }}>
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {paused ? 'Resume' : 'Pause'}
          </button>

          {/* Terminate */}
          <button onClick={handleTerminate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#F87171' }}>
            <X className="w-3.5 h-3.5" /> Terminate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {events.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {events.slice(0, 3).map(ev => (
              <span key={ev.id} className="text-xs px-2 py-1 rounded-full"
                style={{ background: ev.severity === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: ev.severity === 'high' ? '#F87171' : '#FBBF24' }}>
                ⚠ {ev.label}
              </span>
            ))}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'guest' && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3 mt-1"
                style={{ background: msg.guestName?.startsWith('⚠') ? 'rgba(251,191,36,0.2)' : 'rgba(91,33,182,0.3)' }}>
                {msg.guestName?.startsWith('⚠')
                  ? <AlertTriangle className="w-4 h-4" style={{ color: '#FBBF24' }} />
                  : <ChefHat className="w-4 h-4" style={{ color: '#A78BFA' }} />}
              </div>
            )}
            <div className={`max-w-lg`}>
              {msg.role === 'guest' && (
                <p className="text-xs mb-1 ml-1" style={{ color: '#6B8F7A' }}>
                  {msg.guestName || 'Guest'}
                </p>
              )}
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #2D7A4F, #38966A)'
                    : msg.guestName?.startsWith('⚠')
                      ? 'rgba(251,191,36,0.1)'
                      : 'rgba(45,122,79,0.08)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(45,122,79,0.2)',
                  color: '#F0F5F0',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                }}>
                {msg.content}
              </div>
              <p className="text-xs mt-1 px-1" style={{ color: '#3A5A45', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(91,33,182,0.3)' }}>
              <ChefHat className="w-4 h-4" style={{ color: '#A78BFA' }} />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.2)' }}>
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4DB882' }} />
                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4DB882' }} />
                <span className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4DB882' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {paused ? (
        <div className="px-6 py-4 border-t text-center" style={{ borderColor: 'rgba(45,122,79,0.2)', background: '#1A3A2A' }}>
          <p className="text-sm" style={{ color: '#FBBF24' }}>⏸ Session paused</p>
        </div>
      ) : (
        <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(45,122,79,0.2)', background: '#1A3A2A' }}>
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Respond to your guests..."
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#0D1F15', border: '1px solid rgba(45,122,79,0.25)', color: '#F0F5F0' }}
              onFocus={e => (e.target.style.borderColor = '#2D7A4F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(45,122,79,0.25)')}
            />
            <button onClick={sendMessage} disabled={!input.trim()}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #2D7A4F, #38966A)' : 'rgba(45,122,79,0.2)',
                color: input.trim() ? '#F0F5F0' : '#3A5A45',
              }}>
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#3A5A45' }}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  );
}

export default function ChatSessionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ color: '#4DB882' }}>Loading...</div>}>
      <SessionContent />
    </Suspense>
  );
}
