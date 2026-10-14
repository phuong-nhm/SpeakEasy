"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import { VocabularyDto } from "@/features/frontend/lesson/types/lesson";
import { reviewService } from "@/features/frontend/review/services/reviewService";

const PASS_PERCENT = 70;

interface Props {
  lessonId: string;
}

export default function FlashcardReviewClient({ lessonId }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<VocabularyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    lessonService
      .getVocabularyByLesson(lessonId)
      .then((data) => {
        if (mounted) setItems(data);
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
  }, [lessonId]);

  const current = items[index];

  const finishReview = async (finalRememberedCount: number) => {
    const percent =
      items.length === 0 ? 0 : (finalRememberedCount / items.length) * 100;
    const isCorrect = percent >= PASS_PERCENT;

    setIsSubmitting(true);
    try {
      await reviewService.completeReview({ lessonId, isCorrect });
    } catch {
      // không chặn UI nếu lỗi submit
    } finally {
      setIsSubmitting(false);
      setIndex(items.length);
    }
  };

  const onRemembered = () => {
    if (!current) return;
    const nextCount = rememberedCount + 1;
    setRememberedCount(nextCount);

    if (index + 1 < items.length) {
      setIndex(index + 1);
      setShowBack(false);
    } else {
      finishReview(nextCount);
    }
  };

  const onSkip = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setShowBack(false);
    } else {
      finishReview(rememberedCount);
    }
  };

  if (loading)
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Đang tải...
      </div>
    );

  if (!items.length)
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Không có từ vựng để ôn tập.
      </div>
    );

  if (index >= items.length) {
    const percent = Math.round((rememberedCount / items.length) * 100);
    const passed = percent >= PASS_PERCENT;
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">
            Hoàn thành ôn tập
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Bạn nhớ {rememberedCount}/{items.length} từ ({percent}%)
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              passed ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {passed
              ? "✅ Đạt yêu cầu, chu kỳ ôn tập sẽ dời sang mốc xa hơn."
              : "❌ Chưa đạt, chu kỳ ôn tập sẽ quay lại từ đầu."}
          </p>
          <button
            className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            onClick={() => router.push("/review")}
          >
            Về trang Ôn tập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">{current.word}</h3>
          {showBack && (
            <p className="mt-3 text-base font-medium text-slate-700">
              {current.meaning}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setShowBack((s) => !s)}
            disabled={isSubmitting}
          >
            {showBack ? "Ẩn" : "Hiện nghĩa"}
          </button>
          <button
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onRemembered}
            disabled={isSubmitting}
          >
            Tôi nhớ
          </button>
          <button
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Bỏ qua
          </button>
        </div>

        <div className="mt-4 text-center text-sm font-medium text-slate-500">
          {index + 1}/{items.length}
        </div>
      </div>
    </div>
  );
}
