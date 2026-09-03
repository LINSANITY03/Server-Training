"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConversation } from "@/hooks/chat/useConversation";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";

function SessionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionUuid = params.get("id");
  const scenario = params.get("scenario") ?? "Fine Dining Evening Service";
  const guests = params.get("guests") ?? "4";
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Hooks must run unconditionally, in the same order, on every render —
  // so useConversation and both effects below run before any early return.
  const { messages, loading, sending, error, sendMessage } = useConversation(sessionUuid ?? "");

  useEffect(() => {
    if (!sessionUuid) {
      console.log("no sessionid");
      return;
    }
  }, [sessionUuid, router]);

  useEffect(() => {
    if (paused || !sessionUuid) {
      return;
    }

    const timer = window.setInterval(
      () => setElapsed((value) => value + 1),
      1000
    );

    return () => window.clearInterval(timer);
  }, [paused, sessionUuid]);

  if (!sessionUuid) {
    return <div className="p-8">Missing training session.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading conversation...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "#1A3A2A",
          borderColor: "rgba(45,122,79,0.2)",
        }}
      >
        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color: "#F0F5F0",
            }}
          >
            {scenario}
          </p>

          <p
            className="text-xs"
            style={{
              color: "#6B8F7A",
            }}
          >
            {guests} guests · Text session
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-sm font-mono"
            style={{
              color: "#4DB882",
            }}
          >
            {formatDuration(elapsed)}
          </span>

          <button onClick={() => setPaused((value) => !value)}>
            {paused ? "Resume" : "Pause"}
          </button>

          <button onClick={() => router.push("/dashboard")}>Exit</button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          className="px-6 py-3 text-sm"
          style={{
            background: "rgba(248,113,113,0.1)",
            color: "#F87171",
          }}
        >
          {error}
        </div>
      )}

      {/* Conversation */}
      <ChatMessageList messages={messages} typing={sending} />

      {/* Input */}
      <ChatInput disabled={paused} sending={sending} onSend={sendMessage} />
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0"
  )}`;
}

export default function ChatSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
