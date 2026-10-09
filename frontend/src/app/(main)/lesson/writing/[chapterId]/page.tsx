"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import CheckpointWritingExercise from "@/features/frontend/lesson/components/exercises/CheckpointWritingExercise";
import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import {
  AiFeedbackDto,
  WritingTopicDto,
  WritingTopicType,
} from "@/features/frontend/lesson/types/lesson";

interface WritingChapterPageProps {
  params: Promise<{
    chapterId?: string;
  }>;
}

export default function WritingChapterPage({
  params,
}: WritingChapterPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const chapterId: string = resolvedParams?.chapterId ?? "unknown";

  const [topicType, setTopicType] = useState<WritingTopicType>(
    WritingTopicType.Weekly,
  );
  const [topic, setTopic] = useState<WritingTopicDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setTopic(null);

      try {
        const data = await lessonService.getAvailableWritingTopic(
          chapterId,
          topicType,
        );
        if (!mounted) return;
        setTopic(data);
      } catch {
        if (!mounted) return;
        setLoadError("Chưa có đề bài cho lựa chọn này.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [chapterId, topicType]);

  const handleTopicTypeChange = (type: WritingTopicType) => {
    setTopicType(type);
    setScore(0);
    setHearts(3);
  };

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
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleTopicTypeChange(WritingTopicType.Weekly)}
              className={`rounded-full px-3 py-1.5 transition ${
                topicType === WritingTopicType.Weekly
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "hover:bg-slate-100"
              }`}
            >
              Đề tuần
            </button>
            <button
              type="button"
              onClick={() => handleTopicTypeChange(WritingTopicType.Monthly)}
              className={`rounded-full px-3 py-1.5 transition ${
                topicType === WritingTopicType.Monthly
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "hover:bg-slate-100"
              }`}
            >
              Đề tháng
            </button>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ) : loadError || !topic ? (
              <p className="text-sm text-slate-500">
                {loadError ?? "Không có đề writing cho chapter này."}
              </p>
            ) : (
              <CheckpointWritingExercise
                topic={topic}
                onSubmitted={handleSubmitted}
              />
            )}
          </div>
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
