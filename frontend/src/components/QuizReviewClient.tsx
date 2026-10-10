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

  if (loading) return <div>Đang tải...</div>;

  if (!items.length) return <div>Không có câu hỏi ôn tập.</div>;

  if (index >= items.length) {
    const percent = Math.round((correctCount / items.length) * 100);
    return (
      <div>
        <h3>Kết thúc Quiz</h3>
        <p>
          Đúng {correctCount}/{items.length} ({percent}%)
        </p>
        <p>
          {percent >= PASS_PERCENT
            ? "✅ Đạt yêu cầu, chu kỳ ôn tập sẽ dời sang mốc xa hơn."
            : "❌ Chưa đạt, chu kỳ ôn tập sẽ quay lại từ đầu."}
        </p>
        <button
          onClick={() => router.push("/review")}
          style={{ padding: "8px 12px", marginTop: 12 }}
        >
          Về trang Ôn tập
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, marginTop: 12 }}>
      <div style={{ border: "1px solid #ddd", padding: 24, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 8 }}>{current.word}</h3>

        {(["A", "B"] as const).map((key) => {
          const label = key === "A" ? current.optionA : current.optionB;

          return (
            <div key={key} style={{ marginTop: 8 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="radio"
                  checked={selected === key}
                  onChange={() => setSelected(key)}
                  name="choice"
                  disabled={isSubmitting}
                />
                <span>{label}</span>
              </label>
            </div>
          );
        })}

        <div style={{ marginTop: 12 }}>
          <button
            onClick={submit}
            disabled={!selected || isSubmitting}
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
