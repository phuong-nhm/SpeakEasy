"use client";
import React, { useEffect, useState } from "react";
import {
  getDueReviews,
  completeReview,
} from "@/features/frontend/review/services/reviewService";
import { DueReviewItem } from "@/features/frontend/review/types/review";

export default function QuizReviewClient() {
  const [items, setItems] = useState<DueReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    getDueReviews()
      .then((data) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  const current = items[index];

  const submit = async () => {
    if (!current) return;
    const correct = selected && current.meaning && selected === current.meaning;
    if (correct) setScore((s) => s + 10);
    const nextCompleted = [...completedIds, current.id];
    setCompletedIds(nextCompleted);
    setSelected(null);
    if (index + 1 < items.length) setIndex(index + 1);
    else {
      try {
        await completeReview({ ids: nextCompleted });
      } catch (e) {}
      setIndex(items.length);
    }
  };

  if (!items.length) return <div>Không có câu hỏi ôn tập.</div>;

  if (index >= items.length) {
    return (
      <div>
        <h3>Kết thúc Quiz</h3>
        <p>Điểm: {score}</p>
        <p>Đã ôn: {completedIds.length}</p>
      </div>
    );
  }

  const choices = current?.distractors
    ? [current.meaning ?? "", ...(current.distractors || [])]
    : current?.meaning
      ? [current.meaning]
      : [];

  return (
    <div style={{ maxWidth: 720, marginTop: 12 }}>
      <div style={{ border: "1px solid #ddd", padding: 24, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 8 }}>{current.word}</h3>

        {choices.map((c) => (
          <div key={c} style={{ marginTop: 8 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                checked={selected === c}
                onChange={() => setSelected(c)}
                name="choice"
              />
              <span>{c}</span>
            </label>
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <button
            onClick={submit}
            style={{
              padding: "8px 12px",
              background: "#0ea5a4",
              color: "white",
            }}
          >
            Nộp
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
          {index + 1}/{items.length}
        </div>
      </div>
    </div>
  );
}
