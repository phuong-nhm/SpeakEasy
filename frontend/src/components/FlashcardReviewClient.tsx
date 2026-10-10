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
      setIndex(items.length); // chuyển sang màn hoàn thành
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

  if (loading) return <div>Đang tải...</div>;

  if (!items.length) return <div>Không có từ vựng để ôn tập.</div>;

  if (index >= items.length) {
    const percent = Math.round((rememberedCount / items.length) * 100);
    return (
      <div>
        <h3>Hoàn thành ôn tập</h3>
        <p>
          Bạn nhớ {rememberedCount}/{items.length} từ ({percent}%)
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
        {showBack && <p style={{ color: "#444" }}>{current.meaning}</p>}
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowBack((s) => !s)}
            style={{ padding: "8px 12px" }}
            disabled={isSubmitting}
          >
            {showBack ? "Ẩn" : "Hiện nghĩa"}
          </button>
          <button
            onClick={onRemembered}
            style={{
              padding: "8px 12px",
              background: "#0ea5a4",
              color: "white",
            }}
            disabled={isSubmitting}
          >
            Tôi nhớ
          </button>
          <button
            onClick={onSkip}
            style={{ padding: "8px 12px", background: "#eee" }}
            disabled={isSubmitting}
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
