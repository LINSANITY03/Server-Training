"use client";

import { ChefHat } from "lucide-react";
import type { ConversationTurn } from "@/types/training";

interface ChatMessageProps {
  message: ConversationTurn;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "User";
  const isSystem = message.role === "System";

  const timestamp = new Date(message.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div
          className="px-4 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(251,191,36,0.1)",
            color: "#FBBF24",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-slide-up`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3 mt-1"
          style={{
            background: "rgba(91,33,182,0.3)",
          }}
        >
          <ChefHat
            className="w-4 h-4"
            style={{
              color: "#A78BFA",
            }}
          />
        </div>
      )}

      <div className="max-w-lg">
        {!isUser && (
          <p
            className="text-xs mb-1 ml-1"
            style={{
              color: "#6B8F7A",
            }}
          >
            AI Guest
          </p>
        )}

        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? "linear-gradient(135deg, #2D7A4F, #38966A)"
              : "rgba(45,122,79,0.08)",
            border: isUser ? "none" : "1px solid rgba(45,122,79,0.2)",
            color: "#F0F5F0",
            borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          }}
        >
          {message.content}
        </div>

        <p
          className="text-xs mt-1 px-1"
          style={{
            color: "#3A5A45",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}
