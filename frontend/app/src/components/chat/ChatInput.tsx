import { useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isActive: boolean;
}

export default function ChatInput({ onSend, disabled, isActive }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when session starts
  useEffect(() => {
    if (isActive && !disabled) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isActive, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputRef.current?.value.trim()) {
        onSend(inputRef.current.value);
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-4 border-t border-(--border) shrink-0">
      <div className="flex gap-3 items-end">
        <textarea
          ref={inputRef}
          onKeyDown={handleKeyDown}
          disabled={disabled || !isActive}
          placeholder={isActive ? "Respond to your guest... (Enter to send)" : "Start a session to begin training"}
          rows={2}
          className="flex-1 bg-(--surface2) border border-(--border) rounded-(--radius) p-3 text-(--text) text-sm resize-none focus:border-(--amber-light) transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => {
            if (inputRef.current?.value) {
              onSend(inputRef.current.value);
              inputRef.current.value = "";
            }
          }}
          disabled={disabled || !isActive}
          className="w-11 h-11 rounded-(--radius) bg-(--amber) flex items-center justify-center text-[#1a0f00] disabled:opacity-40 transition-opacity hover:opacity-90"
        >
          <i className="ti ti-send text-lg" aria-hidden="true" />
        </button>
      </div>
      <p className="text-[11px] text-(--text-dim) mt-2 text-center">
        You are the server · Respond as you would on the floor
      </p>
    </div>
  );
}