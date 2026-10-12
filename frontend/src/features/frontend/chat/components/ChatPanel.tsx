"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
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
  const { messages, isStreaming, error, toolStatus, sendMessage } =
    useChatStream();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const TOOL_CONFIG: Record<string, { label: string; icon: string }> = {
    get_levels: { label: "Đang tải danh sách cấp độ...", icon: "📚" },
    get_chapters: { label: "Đang tra cứu các chương học...", icon: "📖" },
    get_lessons: { label: "Đang tìm kiếm bài học...", icon: "📝" },
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, toolStatus]);

  // 💡 Đã dọn sạch chữ thừa và chỉnh giới hạn lên 160px (~5-6 dòng)
  const handleInputResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset lại chiều cao để tính toán chính xác
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");

    // Reset lại chiều cao textarea về mặc định sau khi gửi
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // 💡 Cho phép bấm Enter để gửi, Shift + Enter để xuống dòng
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                m.role === "user"
                  ? "ml-auto bg-[#1B3A4B] text-white"
                  : "border border-[#1B3A4B]/10 bg-white text-[#1B3A4B]"
              }`}
            >
              {isPendingAssistant ? (
                toolStatus ? (
                  (() => {
                    const toolInfo = TOOL_CONFIG[toolStatus] || {
                      label: `Đang xử lý (${toolStatus})...`,
                      icon: "⚙️",
                    };

                    return (
                      <div className="flex items-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
                        <span>{toolInfo.icon}</span>
                        <span>{toolInfo.label}</span>
                      </div>
                    );
                  })()
                ) : (
                  <TypingDots />
                )
              ) : (
                m.content
              )}
            </div>
          );
        })}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-[#1B3A4B]/10 p-3 bg-white/50"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputResize}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          rows={1}
          // 💡 Đã đổi max-h-[120px] thành max-h-[160px] để bung đủ khoảng 5-6 dòng
          className="flex-1 resize-none rounded-lg border border-[#1B3A4B]/15 bg-white px-3 py-2 text-sm text-[#1B3A4B] outline-none focus:border-[#1B3A4B]/40 max-h-[160px] overflow-y-auto leading-relaxed"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-lg bg-[#1B3A4B] px-3 py-2 text-sm font-medium text-[#F2C879] disabled:opacity-50 transition-opacity"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
