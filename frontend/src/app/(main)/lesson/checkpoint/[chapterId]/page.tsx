"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roadmapService } from "@/features/frontend/dashboard/services/roadmapService";
import { ChapterDto } from "@/features/frontend/dashboard/types/roadmap";

const statusLabelMap = {
  completed: "Đã học",
  unlocked: "Sẵn sàng ôn",
  locked: "Chưa mở",
} as const;

const statusStyleMap = {
  completed: "bg-emerald-100 text-emerald-700",
  unlocked: "bg-indigo-100 text-indigo-700",
  locked: "bg-slate-100 text-slate-500",
} as const;

export default function Page({ params }: { params: any }) {
  const router = useRouter();
  // `params` may be a Promise in Client Components — unwrap with React.use()
  const resolvedParams = (React as any).use
    ? (React as any).use(params)
    : params;
  const chapterId: string =
    resolvedParams?.chapterId ?? params?.chapterId ?? "unknown";

  const [chapter, setChapter] = useState<ChapterDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadChapter = async () => {
      try {
        const levels = await roadmapService.getRoadmapLevels();
        if (!mounted) return;

        const foundChapter = levels
          .flatMap((level) => level.chapters)
          .find((item) => item.id === chapterId);

        setChapter(foundChapter ?? null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadChapter();

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  const lessons = chapter?.lessons ?? [];

  const chapterStats = useMemo(() => {
    const completed = lessons.filter((lesson) => lesson.isCompleted).length;
    const unlocked = lessons.filter(
      (lesson) => !lesson.isCompleted && !lesson.isLocked,
    ).length;
    const locked = lessons.filter((lesson) => lesson.isLocked).length;
    const totalQuestions = lessons.reduce(
      (total, lesson) => total + lesson.totalQuestions,
      0,
    );

    return {
      completed,
      unlocked,
      locked,
      totalQuestions,
    };
  }, [lessons]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <main className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-5 w-56 animate-pulse rounded-full bg-slate-200" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-4xl space-y-6 px-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900">
              Checkpoint — Chapter {chapterId}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Quay lại dashboard
            </button>
          </div>

          {chapter ? (
            <>
              <p className="mt-2 text-sm text-slate-600">{chapter.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {chapter.description}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-rose-600">
              Không tìm thấy chapter trong mock roadmap.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tổng lesson
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {lessons.length}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Đã học
            </p>
            <p className="mt-2 text-2xl font-black text-emerald-700">
              {chapterStats.completed}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sẵn sàng ôn
            </p>
            <p className="mt-2 text-2xl font-black text-indigo-700">
              {chapterStats.unlocked}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Tổng câu hỏi
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {chapterStats.totalQuestions}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Blueprint
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            Skeleton ôn tập theo chapter (chưa bật logic checkpoint)
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Màn này mới dựng khung coverage để bạn phát triển chapter-review
            aggregator ở bước tiếp theo.
          </p>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson) => {
            const status = lesson.isCompleted
              ? "completed"
              : lesson.isLocked
                ? "locked"
                : "unlocked";

            return (
              <div
                key={lesson.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Lesson {lesson.order}
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-slate-900">
                      {lesson.title}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyleMap[status]}`}
                  >
                    {statusLabelMap[status]}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Grammar/Quiz: TBD
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Listening: TBD
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    Writing: TBD
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Gợi ý coverage: lấy một phần câu hỏi từ lesson này để đưa vào
                  checkpoint chapter.
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/lesson/listening/${chapterId}`}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Mở Listening riêng
          </Link>
          <Link
            href={`/lesson/writing/${chapterId}`}
            className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100"
          >
            Mở Writing AI riêng
          </Link>
        </div>
      </main>
    </div>
  );
}
