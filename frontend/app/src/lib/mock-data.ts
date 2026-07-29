import type { TrainingSession, DashboardStats, PerformanceMetric } from '@/types';

export const mockSessions: TrainingSession[] = [
  {
    id: '1',
    scenario: 'Fine Dining Evening Service',
    guestCount: 4,
    allergies: ['Gluten', 'Shellfish'],
    diningType: 'À la carte',
    sessionType: 'text',
    status: 'ongoing',
    startTime: new Date(Date.now() - 12 * 60 * 1000),
    score: undefined,
    messages: [
      { id: 'm1', role: 'guest', content: 'Good evening, we have a reservation under Thompson.', timestamp: new Date(Date.now() - 11 * 60 * 1000), guestName: 'Guest 1' },
      { id: 'm2', role: 'user', content: 'Good evening, welcome to La Maison. I have your table ready, right this way.', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
      { id: 'm3', role: 'guest', content: 'We\'d like to see the menu please. One of our guests has a gluten allergy.', timestamp: new Date(Date.now() - 9 * 60 * 1000), guestName: 'Guest 2' },
    ],
    events: [
      { id: 'e1', type: 'allergen_served', label: 'Allergen Alert: Bread basket placed on table', timestamp: new Date(Date.now() - 5 * 60 * 1000), severity: 'high' },
    ],
  },
  {
    id: '2',
    scenario: 'Brunch Service Rush',
    guestCount: 6,
    allergies: ['Dairy'],
    diningType: 'Buffet',
    sessionType: 'text',
    status: 'paused',
    startTime: new Date(Date.now() - 45 * 60 * 1000),
    score: undefined,
    messages: [],
    events: [],
  },
  {
    id: '3',
    scenario: 'Corporate Lunch',
    guestCount: 8,
    allergies: [],
    diningType: 'Set menu',
    sessionType: 'text',
    status: 'completed',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    duration: 5400,
    score: 87,
    messages: [],
    events: [],
  },
  {
    id: '4',
    scenario: 'Wedding Banquet',
    guestCount: 50,
    allergies: ['Nuts', 'Shellfish', 'Gluten'],
    diningType: 'Banquet',
    sessionType: 'text',
    status: 'failed',
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    duration: 7200,
    score: 34,
    messages: [],
    events: [],
  },
];

export const dashboardStats: DashboardStats = {
  totalSessions: 47,
  successSessions: 38,
  failedSessions: 5,
  ongoingSessions: 1,
  pausedSessions: 1,
  averageScore: 82,
  weeklyData: [
    { day: 'Mon', sessions: 5, success: 4 },
    { day: 'Tue', sessions: 8, success: 7 },
    { day: 'Wed', sessions: 6, success: 5 },
    { day: 'Thu', sessions: 9, success: 8 },
    { day: 'Fri', sessions: 7, success: 6 },
    { day: 'Sat', sessions: 4, success: 3 },
    { day: 'Sun', sessions: 3, success: 3 },
  ],
};

export const performanceMetrics: PerformanceMetric[] = [
  {
    category: 'Greeting & Seating',
    score: 92,
    trend: 5,
    details: ['Eye contact maintained', 'Proper welcome greeting', 'Efficient table management'],
  },
  {
    category: 'Menu Knowledge',
    score: 78,
    trend: -2,
    details: ['Allergen awareness: needs work', 'Wine pairing: good', 'Daily specials: excellent'],
  },
  {
    category: 'Order Taking',
    score: 85,
    trend: 8,
    details: ['Accurate recording', 'Upselling techniques', 'Dietary accommodation'],
  },
  {
    category: 'Food Service',
    score: 71,
    trend: 3,
    details: ['Timing coordination', 'Correct plate placement', 'Temperature checks'],
  },
  {
    category: 'Problem Handling',
    score: 65,
    trend: 12,
    details: ['Complaint resolution', 'Escalation protocols', 'Recovery strategies'],
  },
  {
    category: 'Closing & Billing',
    score: 88,
    trend: 0,
    details: ['Accurate billing', 'Farewell courtesy', 'Table reset speed'],
  },
];

export const serviceSteps = [
  { step: 1, name: 'Greeting', completed: true },
  { step: 2, name: 'Seating', completed: true },
  { step: 3, name: 'Menu Presentation', completed: true },
  { step: 4, name: 'Order Taking', completed: true },
  { step: 5, name: 'Food Service', completed: false },
  { step: 6, name: 'Check-in', completed: false },
  { step: 7, name: 'Billing', completed: false },
  { step: 8, name: 'Farewell', completed: false },
];

export const allergiesList = [
  'Gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Peanuts',
  'Soybeans',
  'Milk',
  'Nuts',
  'Celery',
  'Mustard',
  'Sesame',
  'Sulphites',
  'Lupin',
  'Molluscs',
];

export const diningTypes = [
  'À la carte', 'Set menu', 'Buffet', 'Tasting menu', 'Banquet', 'Room service',
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
}
