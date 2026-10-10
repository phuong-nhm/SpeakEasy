"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { reviewService } from "@/features/frontend/review/services/reviewService";
import { DueReviewItemDto } from "@/features/frontend/review/types/review";

export default function ReviewPage() {
  const [items, setItems] = useState<DueReviewItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    reviewService
      .getDueReviews()
      .then((data) => {
        if (mounted) setItems(data.items ?? []);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Spaced Repetition Hub</h1>
        <p style={{ marginTop: 6 }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Spaced Repetition Hub</h1>
      <p style={{ marginTop: 6 }}>
        Bạn có <strong>{items.length}</strong> bài học đến hạn ôn tập hôm nay.
      </p>

      {items.length === 0 ? (
        <p style={{ marginTop: 16, color: "#666" }}>
          Không có bài nào cần ôn lúc này. 🎉
        </p>
      ) : (
        <section style={{ marginTop: 28 }}>
          <h2>Danh sách cần ôn</h2>
          <ul style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {items.map((item) => (
              <li
                key={item.lessonId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600 }}>{item.lessonTitle}</p>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    Đến hạn: {new Date(item.nextReviewTime).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/review/flashcards/${item.lessonId}`}
                    style={{
                      padding: "8px 16px",
                      fontWeight: 600,
                      border: "1px solid #0ea5a4",
                      borderRadius: 6,
                      color: "#0ea5a4",
                    }}
                  >
                    Flashcard
                  </Link>
                  <Link
                    href={`/review/quiz/${item.lessonId}`}
                    style={{
                      padding: "8px 16px",
                      background: "#eee",
                      borderRadius: 6,
                    }}
                  >
                    Quiz
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
