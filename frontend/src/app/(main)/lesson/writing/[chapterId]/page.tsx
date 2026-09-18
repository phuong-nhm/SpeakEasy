"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CheckpointWritingExercise from "@/features/frontend/lesson/components/exercises/CheckpointWritingExercise";
import { AiFeedbackDto } from "@/features/frontend/lesson/types/lesson";

interface WritingTopicDto {
  id: string;
  chapterId: string;
  promptTitle: string;
  promptText: string;
}

export default function WritingChapterPage({ params }: { params: any }) {
  const router = useRouter();

  const resolvedParams = (React as any).use
    ? (React as any).use(params)
    : params;
  const chapterId: string =
    resolvedParams?.chapterId ?? params?.chapterId ?? "unknown";

  const [topic, setTopic] = useState<WritingTopicDto | null>(null);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/app/writing-topic/by-chapter?chapterId=${chapterId}`,
        );
        const data = await response.json();

        if (!mounted) return;
        setTopic(data[0] ?? null);
      } catch {
        if (!mounted) return;
        setTopic({
          id: "mock-writing-1",
          chapterId,
          promptTitle: "Describe your learning routine",
          promptText: "Write about how you practice English every day.",
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  const handleSubmitted = (feedback: AiFeedbackDto) => {
    if ((feedback.score ?? 0) >= 80) {
      setScore(1);
    } else {
      setScore(0);
      setHearts((value) => Math.max(0, value - 1));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              Writing AI — Chapter {chapterId}
            </h2>
            <div className="text-sm font-semibold text-slate-700">
              Hearts: {"❤️".repeat(hearts)}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Đây là màn luyện viết riêng, tách khỏi checkpoint.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          {topic ? (
            <CheckpointWritingExercise
              topic={topic}
              onSubmitted={handleSubmitted}
            />
          ) : (
            <p className="text-sm text-slate-500">
              Không có đề writing cho chapter này.
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600">
          Trạng thái bài viết: {score > 0 ? "Đạt" : "Chưa đạt"}
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Quay lại dashboard
        </button>
      </main>
    </div>
  );
}
