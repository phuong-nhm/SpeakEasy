"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChatStream } from "@/features/frontend/chat/hooks/useChatStream";

function TypingDots() {
  return (
    <span className="flex items-center gap-1.5 py-1.5">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <style jsx>{`
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background-color: #1b3a4b;
          animation: typing-bounce 1s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes typing-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          30% {
            transform: translateY(-7px);
            opacity: 1;
          }
        }
      `}</style>
    </span>
  );
}

export function ChatPanel() {
  const { messages, isStreaming, error, sendMessage } = useChatStream();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div
      className={
        expanded
          ? "fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-[#1B3A4B]/10 bg-[#FBF8F2] shadow-2xl shadow-[#1B3A4B]/20 transition-all duration-300 sm:inset-10"
          : "fixed bottom-24 right-6 z-50 flex h-[400px] w-[360px] flex-col overflow-hidden rounded-2xl border border-[#1B3A4B]/10 bg-[#FBF8F2] shadow-2xl shadow-[#1B3A4B]/20 transition-all duration-300"
      }
    >
      <div className="flex items-center justify-between bg-[#1B3A4B] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7FD1AE]" />
          <p className="text-sm font-medium text-[#F2C879]">Trợ lý học tập</p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Thu nhỏ khung chat" : "Phóng to khung chat"}
          className="rounded-md p-1 text-[#F2C879]/80 transition-colors hover:bg-white/10 hover:text-[#F2C879]"
        >
          {expanded ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9 9 4 4m0 5V4h5M15 9l5-5m0 5V4h-5M9 15l-5 5m5-5v5H4m11-5 5 5m0-5v5h-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <p className="text-sm leading-relaxed text-[#1B3A4B]/60">
            Hỏi mình về bài học, từ vựng hoặc tiến độ của bạn nhé.
          </p>
        )}
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const isPendingAssistant =
            m.role === "assistant" && !m.content && isStreaming && isLast;

          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-[#1B3A4B] text-white"
                  : "border border-[#1B3A4B]/10 bg-white text-[#1B3A4B]"
              }`}
            >
              {isPendingAssistant ? <TypingDots /> : m.content}
            </div>
          );
        })}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-[#1B3A4B]/10 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          className="flex-1 rounded-lg border border-[#1B3A4B]/15 bg-white px-3 py-2 text-sm text-[#1B3A4B] outline-none focus:border-[#1B3A4B]/40"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="rounded-lg bg-[#1B3A4B] px-3 py-2 text-sm font-medium text-[#F2C879] disabled:opacity-50"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
