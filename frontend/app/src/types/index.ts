export type SessionStatus = 'ongoing' | 'paused' | 'completed' | 'failed';

export interface TrainingSession {
  id: string;
  scenario: string;
  guestCount: number;
  allergies: string[];
  diningType: string;
  sessionType: 'text' | 'audio' | 'video';
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  score?: number;
  messages: Message[];
  events: SessionEvent[];
}

export interface Message {
  id: string;
  role: 'user' | 'guest';
  content: string;
  timestamp: Date;
  guestName?: string;
}

export interface SessionEvent {
  id: string;
  type: 'food_delayed' | 'drinks_delayed' | 'allergen_served' | 'complaint' | 'compliment' | 'custom';
  label: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface PerformanceMetric {
  category: string;
  score: number;
  trend: number; // percentage change
  details: string[];
}

export interface DashboardStats {
  totalSessions: number;
  successSessions: number;
  failedSessions: number;
  ongoingSessions: number;
  pausedSessions: number;
  averageScore: number;
  weeklyData: { day: string; sessions: number; success: number }[];
}
