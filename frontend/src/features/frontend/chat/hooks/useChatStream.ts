"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/features/frontend/chat/types/chat";

// Đổi lại đúng URL server agent (api.py) của bạn, hoặc set qua .env.local
const CHAT_STREAM_URL = (
  process.env.NEXT_PUBLIC_AGENT_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chỉ sống trong phiên hiện tại (không lưu localStorage) - đúng ý "ngắn hạn thôi"
  const threadIdRef = useRef<string>(crypto.randomUUID());

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      try {
        const res = await fetch(`${CHAT_STREAM_URL}/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            thread_id: threadIdRef.current,
          }),
        });

        if (!res.body) throw new Error("no-body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            if (!chunk.startsWith("data: ")) continue;
            const data = chunk.slice(6);
            if (data === "[DONE]") continue;

            const parsed = JSON.parse(data) as { content: string };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + parsed.content }
                  : m,
              ),
            );
          }
        }
      } catch {
        setError("Không kết nối được trợ lý học tập, thử lại sau nhé.");
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming],
  );

  return { messages, isStreaming, error, sendMessage };
}
