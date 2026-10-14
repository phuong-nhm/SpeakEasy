"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import { VocabularyQuizDto } from "@/features/frontend/lesson/types/lesson";
import { reviewService } from "@/features/frontend/review/services/reviewService";

const PASS_PERCENT = 70;

interface Props {
  lessonId: string;
}

export default function QuizReviewClient({ lessonId }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<VocabularyQuizDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    lessonService
      .getVocabularyQuizBatch(lessonId)
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

  const finishReview = async (finalCorrectCount: number) => {
    const percent =
      items.length === 0 ? 0 : (finalCorrectCount / items.length) * 100;
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

  const submit = () => {
    if (!current || !selected) return;

    const isAnswerCorrect = selected === current.correctOption;
    const nextCorrectCount = isAnswerCorrect ? correctCount + 1 : correctCount;

    setCorrectCount(nextCorrectCount);
    setSelected(null);

    if (index + 1 < items.length) {
      setIndex(index + 1);
    } else {
      finishReview(nextCorrectCount);
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
        Không có câu hỏi ôn tập.
      </div>
    );

  if (index >= items.length) {
    const percent = Math.round((correctCount / items.length) * 100);
    const passed = percent >= PASS_PERCENT;
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">Kết thúc Quiz</h3>
          <p className="mt-2 text-sm text-slate-600">
            Đúng {correctCount}/{items.length} ({percent}%)
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
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">{current.word}</h3>
        </div>

        {(["A", "B"] as const).map((key) => {
          const label = key === "A" ? current.optionA : current.optionB;
          const isSelected = selected === key;

          return (
            <div key={key} className="mt-3">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => setSelected(key)}
                  name="choice"
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </label>
            </div>
          );
        })}

        <button
          className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={submit}
          disabled={!selected || isSubmitting}
        >
          Nộp
        </button>

        <div className="mt-4 text-center text-sm font-medium text-slate-500">
          {index + 1}/{items.length}
        </div>
      </div>
    </div>
  );
}
