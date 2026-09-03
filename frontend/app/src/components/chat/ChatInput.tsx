"use client";

import { Send } from "lucide-react";
import { useState, type SubmitEvent, type KeyboardEvent } from "react";

interface ChatInputProps {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string) => Promise<void>;
}

export function ChatInput({
  disabled = false,
  sending = false,
  onSend,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = async (event?: SubmitEvent) => {
    event?.preventDefault();
    const content = value.trim();
    if (!content || disabled || sending) {
      return;
    }

    await onSend(content);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  if (disabled) {
    return (
      <div
        className="px-6 py-4 border-t text-center"
        style={{
          borderColor: "rgba(45,122,79,0.2)",
          background: "#1A3A2A",
        }}
      >
        <p
          className="text-sm"
          style={{
            color: "#FBBF24",
          }}
        >
          ⏸ Session paused
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="px-6 py-4 border-t"
      style={{
        borderColor: "rgba(45,122,79,0.2)",
        background: "#1A3A2A",
      }}
    >
      <div className="flex gap-3">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          placeholder={
            sending ? "Waiting for AI..." : "Respond to your guests..."
          }
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: "#0D1F15",
            border: "1px solid rgba(45,122,79,0.25)",
            color: "#F0F5F0",
          }}
        />

        <button
          type="submit"
          disabled={!value.trim() || disabled || sending}
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background:
              value.trim() && !sending
                ? "linear-gradient(135deg, #2D7A4F, #38966A)"
                : "rgba(45,122,79,0.2)",
            color: value.trim() && !sending ? "#F0F5F0" : "#3A5A45",
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <p
        className="text-xs mt-2 text-center"
        style={{
          color: "#3A5A45",
        }}
      >
        Press Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}
