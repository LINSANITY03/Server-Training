"use client";

import { useState, useMemo } from "react";
import { SCENARIOS, PAGES } from "@/lib/constant";

// Layout Components
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

// Chat Simulator Components
import ScenarioSelector from "@/components/chat/ScenarioSelector";
import ChatThread from "@/components/chat/ChatThread";
import ChatInput from "@/components/chat/ChatInput";
import LiveEvaluation from "@/components/chat/LiveEvaluation";

// Reporting & Standard Components
import StatCard from "@/components/reports/StatCard";
import SessionHistory from "@/components/reports/SessionHistory";
import StandardItem from "@/components/standards/StandardItem";

// Custom Logic
import { useTrainingUI } from "@/hooks/useTrainingUI";

export default function App() {
  // Navigation & UI State
  const [activePage, setActivePage] = useState("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  
  // Mock History State (for the Reports view)
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // The Engine (Mock AI logic)
  const session = useTrainingUI(selectedScenario);

  // Derive the page title for the Navbar
  const pageTitle = useMemo(() => 
    PAGES.find(p => p.id === activePage)?.label, 
  [activePage]);

  // Handle Session End & Record to History
  const handleEndSession = () => {
    const { overallScore, sessionTime } = session.endSession();
    
    if (overallScore !== null) {
      const newEntry = {
        id: Date.now(),
        scenario: selectedScenario.label,
        score: overallScore,
        time: sessionTime,
        date: new Date().toLocaleDateString(),
      };
      setSessionHistory((prev) => [newEntry, ...prev]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg) text-(--text)">
      {/* 1. Global Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        activePage={activePage} 
        onNavigate={setActivePage} 
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* 2. Global Header */}
        <Navbar 
          title={pageTitle} 
          isActive={session.sessionActive} 
          time={session.sessionTime} 
        />

        {/* 3. Main View Switcher */}
        <main className="flex flex-1 overflow-hidden">
          
          {/* VIEW: CHAT SIMULATOR */}
          {activePage === "chat" && (
            <div className="flex flex-1 overflow-hidden">
              <section className="flex flex-col flex-1 overflow-hidden relative">
                
                {!session.sessionActive && session.messages.length === 0 ? (
                  // Initial State: Setup
                  <div className="flex-1 overflow-y-auto flex items-center">
                    <ScenarioSelector 
                      scenarios={SCENARIOS} 
                      selected={selectedScenario} 
                      onSelect={setSelectedScenario} 
                      onStart={session.startSession} 
                    />
                  </div>
                ) : (
                  // Active State: Chat
                  <>
                    <div className="flex justify-between items-center p-4 border-b border-(--border) bg-(--surface)/30 backdrop-blur-sm z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-(--surface3) flex items-center justify-center">
                          <i className={`ti ${selectedScenario.icon} text-(--amber)`} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold tracking-tight">{selectedScenario.label}</p>
                          <p className="text-[11px] text-(--text-dim)">{selectedScenario.difficulty} Difficulty</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleEndSession}
                        className="px-4 py-1.5 rounded-(--radius) bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all active:scale-95"
                      >
                        Terminate Session
                      </button>
                    </div>

                    <ChatThread messages={session.messages} loading={session.loading} />
                    
                    <ChatInput 
                      onSend={session.sendMessage} 
                      disabled={session.loading} 
                      isActive={session.sessionActive} 
                    />
                  </>
                )}
              </section>

              {/* Sticky Evaluation Sidebar */}
              <LiveEvaluation 
                scores={session.scores} 
                overall={session.overallScore} 
                feedback={session.overallScore ? "Focus on describing the flavor notes of the wine more vividly." : undefined}
              />
            </div>
          )}

          {/* VIEW: REPORTS */}
          {activePage === "reports" && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-6xl mx-auto w-full animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  label="Avg. Proficiency" 
                  value="84%" 
                  icon="ti-chart-line" 
                  trend={{ value: 12, isPositive: true }} 
                  description="Based on recent mock trials" 
                />
                <StatCard 
                  label="Total Practice" 
                  value={sessionHistory.length} 
                  icon="ti-award" 
                  description="Sessions successfully completed" 
                />
                <StatCard 
                  label="Training Velocity" 
                  value="High" 
                  icon="ti-bolt" 
                  description="Assessment engagement rate" 
                />
              </div>
              
              <SessionHistory history={sessionHistory} />
            </div>
          )}

          {/* VIEW: STANDARDS */}
          {activePage === "standards" && (
            <div className="flex-1 overflow-y-auto p-8 space-y-4 max-w-4xl mx-auto w-full animate-fade-in">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-semibold mb-2">Service Benchmarks</h2>
                <p className="text-(--text-muted) text-sm">Review the core metrics used to evaluate your floor performance.</p>
              </div>
              
              <StandardItem 
                id="std_1"
                title="Upselling & Suggestions"
                icon="ti-trending-up"
                weight={25}
                description="The ability to naturally offer premium alternatives or accompaniments."
                criteria={[
                  "Contextual relevance to the guest's current order", 
                  "Sensory descriptions over transactional language", 
                  "Non-aggressive, hospitable tone"
                ]}
                exemplarDialogue={{
                  bad: "Do you want to see the dessert menu?",
                  good: "Our pastry chef just finished a fresh batch of dark chocolate soufflé; it pairs exquisitely with our house espresso."
                }}
              />
              <StandardItem 
                id="std_2"
                title="Technical Product Knowledge"
                icon="ti-book"
                weight={30}
                description="Deep understanding of ingredients, prep methods, and dietary safety protocols."
                criteria={[
                  "Immediate ingredient accuracy", 
                  "Clear explanation of preparation methods", 
                  "Strict allergy and cross-contamination awareness"
                ]}
                exemplarDialogue={{
                  bad: "I think there's nuts in that, let me check.",
                  good: "The pesto is prepared with pine nuts; I will immediately verify with the chef to ensure our prep station is clear of cross-contamination."
                }}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}