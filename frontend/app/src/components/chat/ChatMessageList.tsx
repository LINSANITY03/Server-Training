"use client";

import { useEffect, useRef } from "react";
import type { ConversationTurn } from "@/types/training";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ConversationTurn[];
  typing: boolean;
}

export function ChatMessageList({ messages, typing }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.uuid} message={message} />
      ))}

      {typing && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: "rgba(91,33,182,0.3)",
        }}
      >
        <span
          className="text-sm"
          style={{
            color: "#A78BFA",
          }}
        >
          AI
        </span>
      </div>

      <div
        className="px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(45,122,79,0.08)",
          border: "1px solid rgba(45,122,79,0.2)",
        }}
      >
        <div className="flex gap-1.5 items-center h-4">
          {[1, 2, 3].map((index) => (
            <span
              key={index}
              className="w-2 h-2 rounded-full typing-dot"
              style={{
                background: "#4DB882",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
