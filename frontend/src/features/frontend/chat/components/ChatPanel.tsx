"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChatStream } from "@/features/frontend/chat/hooks/useChatStream";

export function ChatPanel() {
  const { messages, isStreaming, error, sendMessage } = useChatStream();
  const [input, setInput] = useState("");
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
    <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-[#1B3A4B]/10 bg-[#FBF8F2] shadow-2xl shadow-[#1B3A4B]/20">
      <div className="flex items-center gap-2 bg-[#1B3A4B] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#7FD1AE]" />
        <p className="text-sm font-medium text-[#F2C879]">Trợ lý học tập</p>
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
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-[#1B3A4B] text-white"
                : "border border-[#1B3A4B]/10 bg-white text-[#1B3A4B]"
            }`}
          >
            {m.content || (isStreaming ? "…" : "")}
          </div>
        ))}
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
