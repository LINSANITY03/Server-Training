import { useState, useRef, useEffect, useCallback } from "react";

export function useTrainingUI(scenario: any) {
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Mock evaluation state for UI testing
  const [scores, setScores] = useState({ greeting: null, knowledge: null, upselling: null, empathy: null, standards: null });
  const [overallScore, setOverallScore] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle the live timer UX
  useEffect(() => {
    if (sessionActive) {
      timerRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [sessionActive]);

  const startSession = useCallback(() => {
    setMessages([]);
    setOverallScore(null);
    setSessionTime(0);
    setLoading(true);
    setSessionActive(true);

    // Simulate initial AI greeting delay
    setTimeout(() => {
      setMessages([{ role: "guest", content: "The server approaches your table.", ts: Date.now() }]);
      setLoading(false);
    }, 1200);
  }, [scenario]);

  const sendMessage = useCallback((input: string) => {
    if (!input.trim() || loading || !sessionActive) return;
    
    // Add user message instantly
    setMessages(prev => [...prev, { role: "server", content: input, ts: Date.now() }]);
    setLoading(true);

    // Simulate AI thinking and evaluating
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "guest", content: "I'll have the sparkling water, please. Are you ready to take my order?", ts: Date.now() }]);
      
      // Mock score update to test UI ring animations
      setOverallScore(Math.floor(Math.random() * 40) + 60); // Random score 60-100
      setScores({
        greeting: 85 as any, knowledge: 70 as any, upselling: 40 as any, empathy: 90 as any, standards: 80 as any
      });
      
      setLoading(false);
    }, 2000);
  }, [loading, sessionActive]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    return { overallScore, sessionTime };
  }, [overallScore, sessionTime]);

  return { sessionActive, messages, loading, scores, overallScore, sessionTime, startSession, sendMessage, endSession };
}