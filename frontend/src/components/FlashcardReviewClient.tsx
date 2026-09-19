"use client";
import React, { useEffect, useState } from "react";
import {
  getDueReviews,
  completeReview,
} from "@/features/frontend/review/services/reviewService";
import { DueReviewItem } from "@/features/frontend/review/types/review";

export default function FlashcardReviewClient() {
  const [items, setItems] = useState<DueReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    getDueReviews()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const current = items[index];

  const onGotIt = async () => {
    if (!current) return;
    const nextCompleted = [...completedIds, current.id];
    setCompletedIds(nextCompleted);
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setShowBack(false);
    } else {
      try {
        await completeReview({ ids: nextCompleted });
      } catch (e) {}
      setIndex(items.length);
    }
  };

  if (!items.length) return <div>Không có item để ôn tập.</div>;

  if (index >= items.length) {
    return (
      <div>
        <h3>Hoàn thành ôn tập</h3>
        <p>Bạn đã ôn {completedIds.length} mục.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, marginTop: 12 }}>
      <div style={{ border: "1px solid #ddd", padding: 24, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 8 }}>{current.word ?? "-"}</h3>
        {showBack && <p style={{ color: "#444" }}>{current.meaning ?? "-"}</p>}
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowBack((s) => !s)}
            style={{ padding: "8px 12px" }}
          >
            {showBack ? "Ẩn" : "Hiện nghĩa"}
          </button>
          <button
            onClick={onGotIt}
            style={{
              padding: "8px 12px",
              background: "#0ea5a4",
              color: "white",
            }}
          >
            Tôi nhớ
          </button>
          <button
            onClick={() => {
              if (index + 1 < items.length) setIndex(index + 1);
            }}
            style={{ padding: "8px 12px", background: "#eee" }}
          >
            Bỏ qua
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
          {index + 1}/{items.length}
        </div>
      </div>
    </div>
  );
}
