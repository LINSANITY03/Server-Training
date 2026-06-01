"use client";

import { useEffect, useRef } from "react";

interface Message {
  role: "guest" | "server";
  content: string;
  ts: number;
}

interface ChatThreadProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatThread({ messages, loading }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message or loading state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 scroll-smooth">
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-(--text-dim) text-center animate-fade-in">
          <i className="ti ti-message-chatbot text-4xl mb-3 opacity-50" aria-hidden="true" />
          <p className="text-sm">Your training session will appear here</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {messages.map((m, i) => {
          const isServer = m.role === "server";
          return (
            <article 
              key={i} 
              className={`flex gap-3 max-w-[85%] ${isServer ? "self-end flex-row-reverse" : "self-start"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold
                ${isServer 
                  ? "bg-(--amber-dim) border border-[rgba(212,148,58,0.3)] text-(--amber)" 
                  : "bg-(--surface3) border border-(--border) text-(--text-muted)"
                }`}
              >
                {isServer ? "JS" : <i className="ti ti-user text-base" aria-hidden="true" />}
              </div>

              {/* Message Bubble */}
              <div className={`px-4 py-2.5 shadow-sm
                ${isServer 
                  ? "bg-(--amber-dim) border border-[rgba(212,148,58,0.2)] text-(--amber-light) rounded-[14px_4px_14px_14px]" 
                  : "bg-(--surface2) border border-(--border) text-(--text) rounded-[4px_14px_14px_14px]"
                }`}
              >
                <p className="text-[13.5px] leading-relaxed">{m.content}</p>
              </div>
            </article>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-(--surface3) border border-(--border) flex items-center justify-center">
              <i className="ti ti-user text-base text-(--text-muted)" aria-hidden="true" />
            </div>
            <div className="bg-(--surface2) border border-(--border) rounded-[4px_14px_14px_14px] px-4 py-3 flex gap-1.5 items-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-(--text-dim) animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-(--text-dim) animate-[bounce_1s_0.2s_infinite]" />
              <span className="w-1.5 h-1.5 rounded-full bg-(--text-dim) animate-[bounce_1s_0.4s_infinite]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}