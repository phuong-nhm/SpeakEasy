"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/features/frontend/chat/types/chat";
import { useAuthContext } from "@/features/frontend/auth/contexts/AuthContext";

const CHAT_STREAM_URL = (
  process.env.NEXT_PUBLIC_AGENT_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);

  const router = useRouter();
  const { accessToken, logout } = useAuthContext();

  const threadIdRef = useRef<string>(crypto.randomUUID());

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      if (!accessToken) {
        setError("Vui lòng đăng nhập để sử dụng trợ lý học tập.");
        router.push("/");
        return;
      }

      setError(null);
      setToolStatus(null);

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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: trimmed,
            thread_id: threadIdRef.current,
          }),
        });

        if (res.status === 401) {
          logout();
          router.push("/");
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          );
        }

        if (res.status === 403) {
          throw new Error(
            "Bạn không có quyền thực hiện hành động này với trợ lý.",
          );
        }

        if (!res.ok) {
          throw new Error(`Lỗi từ máy chủ: ${res.statusText}`);
        }

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
            const dataStr = chunk.slice(6).trim();
            if (!dataStr) continue;

            if (dataStr === "[DONE]") continue;

            const parsed = JSON.parse(dataStr) as {
              type?: "token" | "tool_start" | "tool_end" | "error" | "done";
              content?: string;
              tool?: string;
              message?: string;
              error?: string;
            };

            if (parsed.type === "error" || parsed.message) {
              throw new Error(
                parsed.message ||
                  parsed.error ||
                  "Lỗi không xác định từ trợ lý.",
              );
            }

            if (parsed.type === "tool_start") {
              setToolStatus(parsed.tool || "");
              continue;
            }

            if (parsed.type === "tool_end") {
              setToolStatus(null);
              continue;
            }

            if (parsed.type === "done") {
              setToolStatus(null);
              break;
            }

            if (parsed.type === "token" && parsed.content) {
              setToolStatus(null);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m,
                ),
              );
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Không kết nối được trợ lý học tập, thử lại sau nhé.";
        setError(errorMessage);
      } finally {
        setIsStreaming(false);
        setToolStatus(null);
      }
    },
    [isStreaming, accessToken, logout, router],
  );

  return { messages, isStreaming, error, toolStatus, sendMessage };
}
