"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  count: number;
};

export default function ReviewStartButton({ count }: Props) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
      <button
        onClick={() => router.push("/review/flashcards")}
        style={{ padding: "8px 16px", fontWeight: 600 }}
      >
        Start Flashcard Review ({count})
      </button>
      <button
        onClick={() => router.push("/review/quiz")}
        style={{ padding: "8px 16px", background: "#eee" }}
      >
        Start Quiz
      </button>
    </div>
  );
}
