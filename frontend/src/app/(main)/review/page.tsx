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
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-black text-slate-900">Ôn tập</h1>
            <p className="mt-2 text-sm text-slate-500">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Review
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Ôn tập</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bạn có{" "}
            <span className="font-bold text-indigo-700">{items.length}</span>{" "}
            bài học đến hạn ôn tập hôm nay.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm font-medium text-slate-500 shadow-sm">
            Không có bài nào cần ôn lúc này. 🎉
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.lessonId}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {item.lessonTitle}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Đến hạn: {new Date(item.nextReviewTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/review/flashcards/${item.lessonId}`}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Flashcard
                  </Link>
                  <Link
                    href={`/review/quiz/${item.lessonId}`}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Quiz
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
