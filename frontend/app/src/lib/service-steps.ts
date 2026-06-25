export type StepStatus = 'completed' | 'active' | 'locked' | 'na';

export interface ServiceStep {
  id: string;
  code: string;
  criteria: string;
  weight: number;
  phase: string;
  phaseOrder: number;
  scoring: string;
  tip?: string;
}

export interface ServicePhase {
  id: string;
  label: string;
  icon: string;
  color: string;
  steps: ServiceStep[];
}

export const servicePhases: ServicePhase[] = [
  {
    id: 'arrival',
    label: 'Arrival & Greeting',
    icon: '🚪',
    color: '#2D7A4F',
    steps: [
      { id: '5.10', code: '5.10', criteria: 'Warm greeting within 2 minutes of seating', weight: 10, phase: 'arrival', phaseOrder: 0, scoring: '10 / 0', tip: 'Make eye contact, smile, and acknowledge the guest immediately — even if you\'re serving another table.' },
      { id: '5.20', code: '5.20', criteria: 'Asked about dietary requirements or allergies', weight: 20, phase: 'arrival', phaseOrder: 0, scoring: '20 / 0', tip: 'Always ask proactively. Never wait for the guest to bring it up.' },
      { id: '5.30', code: '5.30', criteria: 'Did you state you had an allergy or intolerance?', weight: 0, phase: 'arrival', phaseOrder: 0, scoring: '0 / 0', tip: 'Guest-declared step — this is logged if the guest mentions an allergy themselves.' },
      { id: '5.40', code: '5.40', criteria: 'Handled allergy/intolerance confidently and seamlessly', weight: 10, phase: 'arrival', phaseOrder: 0, scoring: '10 / 0', tip: 'Know the menu allergen matrix. Reassure the guest that you will communicate this to the kitchen.' },
    ],
  },
  {
    id: 'menu',
    label: 'Menu Presentation',
    icon: '📋',
    color: '#38966A',
    steps: [
      { id: '5.50', code: '5.50', criteria: 'Asked if familiar with the menu', weight: 5, phase: 'menu', phaseOrder: 1, scoring: '5 / 0', tip: 'Ask naturally — "Is this your first time with us, or are you familiar with how we do things?"' },
      { id: '5.60', code: '5.60', criteria: 'Did you state you were familiar with the menu?', weight: 0, phase: 'menu', phaseOrder: 1, scoring: '0 / 0', tip: 'Guest-declared step.' },
      { id: '5.70', code: '5.70', criteria: 'Offered assistance with the menu', weight: 5, phase: 'menu', phaseOrder: 1, scoring: '5 / 0', tip: 'Offer to walk guests through highlights, not just "let me know if you have questions".' },
      { id: '5.80', code: '5.80', criteria: 'Explained sharing dishes and serving style', weight: 20, phase: 'menu', phaseOrder: 1, scoring: '20 / 0', tip: 'Dishoom is sharing-style — explain this clearly before order taking to set expectations.' },
      { id: '5.90', code: '5.90', criteria: 'All menu items available', weight: 20, phase: 'menu', phaseOrder: 1, scoring: '20 / 0', tip: 'Know what\'s 86\'d before service. Proactively mention if anything is unavailable.' },
      { id: '5.10b', code: '5.10*', criteria: 'Mentioned and explained house special and black daal', weight: 10, phase: 'menu', phaseOrder: 1, scoring: '10 / 0', tip: 'The black daal is slow-cooked for 24 hours — this story sells it. Make it personal.' },
      { id: '5.11', code: '5.11', criteria: 'Introduced signature tipples and guest beers', weight: 20, phase: 'menu', phaseOrder: 1, scoring: '20 / 0', tip: 'Know the cocktail menu. Have a personal recommendation ready.' },
      { id: '5.12', code: '5.12', criteria: 'Asked if there were more menu questions', weight: 10, phase: 'menu', phaseOrder: 1, scoring: '10 / 0', tip: 'Don\'t rush this. Give guests a moment to think before moving on.' },
    ],
  },
  {
    id: 'drinks',
    label: 'Drinks & Starters',
    icon: '🍹',
    color: '#4DB882',
    steps: [
      { id: '5.13', code: '5.13', criteria: 'Offered water and other drinks', weight: 20, phase: 'drinks', phaseOrder: 2, scoring: '20 / 0', tip: 'Offer still or sparkling water first — it\'s an easy yes and sets the tone.' },
      { id: '5.14', code: '5.14', criteria: 'Offered Chota Papad with Mango chutney', weight: 10, phase: 'drinks', phaseOrder: 2, scoring: '10 / 0', tip: 'This is Dishoom\'s signature pre-starter — always offer it with a warm description.' },
      { id: '5.15', code: '5.15', criteria: 'Drinks arrived within 3–4 minutes', weight: 5, phase: 'drinks', phaseOrder: 2, scoring: '5 / 0', tip: 'Timing starts from when the order is placed. Communicate with the bar if it\'s busy.' },
      { id: '5.16', code: '5.16', criteria: 'Apologised for any drink delay', weight: 5, phase: 'drinks', phaseOrder: 2, scoring: '5 / 0', tip: 'Apologise proactively before the guest notices. Don\'t wait to be asked.' },
      { id: '5.17', code: '5.17', criteria: 'Drinks delivered and perfectly served', weight: 5, phase: 'drinks', phaseOrder: 2, scoring: '5 / 0', tip: 'Right glass, right garnish, no drips. Present to the guest before placing.' },
    ],
  },
  {
    id: 'ordering',
    label: 'Order Taking',
    icon: '✍️',
    color: '#72CC9E',
    steps: [
      { id: '5.18', code: '5.18', criteria: 'Promptly offered to take food order', weight: 5, phase: 'ordering', phaseOrder: 3, scoring: 'N/A / 5 / 0', tip: 'Read the table — don\'t interrupt a conversation, but don\'t leave them waiting either.' },
      { id: '5.19', code: '5.19', criteria: 'Knowledgeable and hospitable while taking order', weight: 10, phase: 'ordering', phaseOrder: 3, scoring: '10 / 0', tip: 'Know the menu inside out. Use descriptive language — "the lamb chops are smoky and beautifully charred".' },
      { id: '5.20b', code: '5.20*', criteria: 'Helped pair dishes appropriately', weight: 5, phase: 'ordering', phaseOrder: 3, scoring: '5 / 0', tip: 'Suggest complementary dishes. Think about balance — light and rich, spicy and cool.' },
      { id: '5.21', code: '5.21', criteria: 'Suggested sides with the meal', weight: 5, phase: 'ordering', phaseOrder: 3, scoring: '5 / 0', tip: 'Always suggest a bread and rice pairing. It enhances the experience and increases cover spend.' },
      { id: '5.22', code: '5.22', criteria: 'Offered handmade breads', weight: 5, phase: 'ordering', phaseOrder: 3, scoring: '5 / 0', tip: 'The roomali roti and paratha are made fresh. Mention that they\'re handmade when offering.' },
    ],
  },
  {
    id: 'service',
    label: 'During Service',
    icon: '🍽️',
    color: '#A78BFA',
    steps: [
      { id: '5.23', code: '5.23', criteria: 'Were drinks low during meal?', weight: 0, phase: 'service', phaseOrder: 4, scoring: '0 / 0', tip: 'Observation step — check this to know if you proactively managed it.' },
      { id: '5.24', code: '5.24', criteria: 'Offered additional drinks', weight: 5, phase: 'service', phaseOrder: 4, scoring: '5 / 0', tip: 'Scan the table every time you pass. Offer before the glass is empty.' },
      { id: '5.25', code: '5.25', criteria: 'Did you order additional drinks?', weight: 0, phase: 'service', phaseOrder: 4, scoring: '0 / 0', tip: 'Guest-declared step.' },
      { id: '5.26', code: '5.26', criteria: 'Additional drinks arrived within 3–4 minutes', weight: 5, phase: 'service', phaseOrder: 4, scoring: '5 / 0', tip: 'Same standard as initial drinks — timing is everything.' },
      { id: '5.27', code: '5.27', criteria: 'Food arrived in a timely manner', weight: 10, phase: 'service', phaseOrder: 4, scoring: '10 / 0', tip: 'Know the kitchen ticket times. Communicate to guests if there\'s a delay before they ask.' },
      { id: '5.28', code: '5.28', criteria: 'Apologised for food delay before noticed', weight: 10, phase: 'service', phaseOrder: 4, scoring: '10 / 0', tip: 'Proactive service recovery. Visit the table, acknowledge the delay, give an ETA.' },
      { id: '5.29', code: '5.29', criteria: 'Runner introduced dishes clearly', weight: 10, phase: 'service', phaseOrder: 4, scoring: '10 / 0', tip: 'Name the dish and place it in front of the right guest. Brief description adds warmth.' },
      { id: '5.30b', code: '5.30*', criteria: 'Checked enjoyment shortly after food arrived', weight: 20, phase: 'service', phaseOrder: 4, scoring: '20 / 0', tip: 'Check back within 2–3 minutes of food being served — not immediately, not 15 minutes later.' },
      { id: '5.31', code: '5.31', criteria: 'Food served at correct temperature', weight: 20, phase: 'service', phaseOrder: 4, scoring: '20 / 0', tip: 'Hot food hot, cold food cold. Touch the plate base before serving (carefully).' },
      { id: '5.32', code: '5.32', criteria: 'Ensured no waiting for drinks during evening', weight: 5, phase: 'service', phaseOrder: 4, scoring: '5 / 0', tip: 'Continuous drink management throughout the meal — not just at order time.' },
    ],
  },
  {
    id: 'clearing',
    label: 'Clearing & Desserts',
    icon: '🧹',
    color: '#F59E0B',
    steps: [
      { id: '5.33', code: '5.33', criteria: 'Checked meal enjoyment before clearing table', weight: 20, phase: 'clearing', phaseOrder: 5, scoring: '20 / 0', tip: 'Ask genuinely — "Did you enjoy everything?" — and listen to the answer. This is your feedback moment.' },
      { id: '5.34', code: '5.34', criteria: 'Table cleared promptly and left tidy', weight: 5, phase: 'clearing', phaseOrder: 5, scoring: '5 / 0', tip: 'Clear from the right, crumb the table if needed, reset before presenting dessert menus.' },
      { id: '5.35', code: '5.35', criteria: 'Delivered dessert menus and recommended dessert', weight: 5, phase: 'clearing', phaseOrder: 5, scoring: '5 / 0', tip: 'Have a dessert recommendation ready. "The kulfi is perfect to end — it\'s cooling and not too sweet."' },
      { id: '5.36', code: '5.36', criteria: 'Table kept neat and tidy throughout visit', weight: 10, phase: 'clearing', phaseOrder: 5, scoring: '10 / 0', tip: 'Ongoing throughout the meal — condiments straight, debris cleared, no clutter.' },
      { id: '5.37', code: '5.37', criteria: 'Returned promptly for dessert/coffee/chai order', weight: 5, phase: 'clearing', phaseOrder: 5, scoring: '5 / 0', tip: 'Give them 3–4 minutes to read the menu, then return. Don\'t leave them waiting.' },
      { id: '5.38', code: '5.38', criteria: 'Did you order desserts/coffees/chai?', weight: 0, phase: 'clearing', phaseOrder: 5, scoring: '0 / 0', tip: 'Guest-declared step.' },
      { id: '5.39', code: '5.39*', criteria: 'Desserts/coffees/chai arrived timely', weight: 5, phase: 'clearing', phaseOrder: 5, scoring: '5 / 0', tip: 'Same timing expectation as drinks — within 3–4 minutes of ordering.' },
      { id: '5.40', code: '5.40', criteria: 'Desserts/coffees/chai served at correct temperature', weight: 5, phase: 'clearing', phaseOrder: 5, scoring: '5 / 0', tip: 'Chai should be steaming. Ice cream should not be melting. Time it right.' },
    ],
  },
  {
    id: 'close',
    label: 'Closing & Farewell',
    icon: '👋',
    color: '#F87171',
    steps: [
      { id: '5.42', code: '5.42', criteria: 'Asked if anything else was needed', weight: 5, phase: 'close', phaseOrder: 6, scoring: '5 / 0', tip: 'A simple "Is there anything else I can get for you this evening?" before bringing the bill.' },
      { id: '5.43', code: '5.43', criteria: 'Bill arrived in a timely manner', weight: 10, phase: 'close', phaseOrder: 6, scoring: '10 / 0', tip: 'When a guest asks for the bill, that\'s the priority. Aim for under 3 minutes.' },
      { id: '5.44', code: '5.44', criteria: 'Asked if visit was enjoyed during payment', weight: 5, phase: 'close', phaseOrder: 6, scoring: '5 / 0', tip: 'This is your last impression. Make it warm and personal — "I hope we\'ll see you again soon."' },
      { id: '5.45', code: '5.45', criteria: 'Attentive without being intrusive', weight: 5, phase: 'close', phaseOrder: 6, scoring: '5 / 0', tip: 'The art of good service — present when needed, invisible when not. Read the table\'s energy.' },
      { id: '5.46', code: '5.46', criteria: 'Team members thanked and said goodbye on exit', weight: 20, phase: 'close', phaseOrder: 6, scoring: '20 / 0', tip: 'Every team member near the exit should acknowledge departing guests. This is a team sport.' },
    ],
  },
];

export const allSteps = servicePhases.flatMap(p => p.steps);

export function getTotalWeight(phaseId?: string): number {
  const steps = phaseId
    ? servicePhases.find(p => p.id === phaseId)?.steps || []
    : allSteps;
  return steps.reduce((sum, s) => sum + s.weight, 0);
}

export function getPhaseProgress(phaseId: string, completedIds: string[]): number {
  const phase = servicePhases.find(p => p.id === phaseId);
  if (!phase) return 0;
  const totalWeight = phase.steps.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 100;
  const earnedWeight = phase.steps
    .filter(s => completedIds.includes(s.id))
    .reduce((sum, s) => sum + s.weight, 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}