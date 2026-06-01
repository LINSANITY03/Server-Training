// Navigation Panel Hierarchy Definition
export const PAGES = [
    { id: "chat", label: "Interactive Simulator", icon: "ti-message-chatbot" },
    { id: "reports", label: "Performance Reports", icon: "ti-chart-bar" },
    { id: "standards", label: "Service Standards", icon: "ti-book" }
  ] as const;
  
  // Scenario Calibration Interface Mapping
  export interface Scenario {
    id: string;
    label: string;
    icon: string;
    difficulty: "Easy" | "Medium" | "Hard";
    mood: string;
    desc: string;
    context: string;
  }
  
  // Global Training Scenarios Framework
  export const SCENARIOS: Scenario[] = [
    {
      id: "scen_1",
      label: "The Impatient Executive",
      icon: "ti-briefcase",
      difficulty: "Medium",
      mood: "Rushed and hyper-focused on efficiency",
      desc: "A solo business traveler on a tight schedule needs quick answers, crisp menu deep-dives, and an expedited runtime timeline.",
      context: "Table 40. A high-profile corporate client has sat down alone. They are reviewing contracts on their phone. They need to conclude their dinner selection within 40 minutes to catch an airport shuttle. They appreciate professional efficiency over warm conversational banter."
    },
    {
      id: "scen_2",
      label: "The Anniversary Celebration",
      icon: "ti-glass-full",
      difficulty: "Easy",
      mood: "Joyful, open to suggestions, celebrating a milestone",
      desc: "An enthusiastic couple celebrating their 10th anniversary looking for a premium, curated evening filled with personalized recommendations.",
      context: "Table 12. Mr. and Mrs. Davis are celebrating their wedding anniversary. They have explicitly stated they want an exceptional dining journey. They are highly receptive to sensory menu storytelling, premium wine pairings, and curated dessert selections."
    },
    {
      id: "scen_3",
      label: "The Severe Seafood Allergy",
      icon: "ti-alert-circle",
      difficulty: "Hard",
      mood: "Anxious, precise, careful about ingredient profiles",
      desc: "A protective diner with severe dietary cross-contamination risks requiring technical menu accuracy and standard operating procedure execution.",
      context: "Table 4. A guest mentions a severe, life-threatening anaphylactic response to shellfish. This script tests the server's exact menu ingredient knowledge, immediate standard protocol compliance, clear kitchen communication assurances, and empathetic security validation."
    },
    {
      id: "scen_4",
      label: "The Indecisive Foodie",
      icon: "ti-tools-kitchen-2",
      difficulty: "Medium",
      mood: "Curious, hesitant, seeking expert confirmation",
      desc: "A diner torn between multiple core courses who tests your ability to breakdown structural flavor composition profiles cleanly.",
      context: "Table 22. This guest is highly passionate about gastronomy but struggles to make a definitive choice between the Branzino and the Wagyu Fillet. They will test your sensory vocabulary descriptors and structured upselling mechanics."
    }
  ];
  
  // Evaluation Metrics Mapping Matrix
  export const CRITERIA = [
    { key: "greeting", label: "Greeting & Presence", icon: "ti-user-star" },
    { key: "knowledge", label: "Menu Knowledge", icon: "ti-book" },
    { key: "upselling", label: "Upselling", icon: "ti-trending-up" },
    { key: "empathy", label: "Empathy & Tone", icon: "ti-heart" },
    { key: "standards", label: "Standards Adherence", icon: "ti-checklist" }
  ] as const;
  
  // Textual Reference Prompt Framework for the Hospitality Scoring Model
  export const STANDARDS = `
  SERVICE ASSESSMENT BENCHMARKS MATRIX:
  
  1. GREETING & PRESENCE:
  - Prompt validation within spatial bounds.
  - Warm, grounded, premium vocabulary deployment.
  
  2. MENU KNOWLEDGE:
  - Structural ingredient clarity.
  - Flavor profiles outlined using explicit sensory attributes.
  
  3. UPSELLING MECHANICS:
  - Recommending premium substitutions or add-ons contextually.
  - Explaining matching value addition parameters instead of aggressive transactions.
  
  4. EMPATHY & TONE:
  - Active listening signs displayed inline.
  - Tuning tone parameters to match guest behaviors and emotional indicators.
  
  5. STANDARDS ADHERENCE:
  - Immediate dietary risk escalation controls.
  - Structural order verification actions.
  `;