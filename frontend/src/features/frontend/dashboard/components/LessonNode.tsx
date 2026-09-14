"use client";

import { useRouter } from "next/navigation";

import { LessonDto } from "../types/roadmap";

interface LessonNodeProps {
  lesson: LessonDto;
  alignRight?: boolean;
}

export function LessonNode({ lesson, alignRight = false }: LessonNodeProps) {
  const router = useRouter();

  const isCompleted = lesson.isCompleted;
  const isLocked = lesson.isLocked;
  const isUnlocked = !isCompleted && !isLocked;

  const stateClasses = isCompleted
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-100 hover:bg-emerald-100"
    : isUnlocked
      ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-indigo-100 hover:bg-indigo-100 animate-pulse"
      : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200";

  const statusIcon = isCompleted ? "✓" : isLocked ? "🔒" : "•";

  return (
    <button
      type="button"
      onClick={() => {
        if (!lesson.isLocked) {
          router.push(`/lesson/${lesson.id}`);
        }
      }}
      disabled={lesson.isLocked}
      className={`group flex w-full max-w-[420px] items-center justify-between rounded-2xl border p-3 text-left shadow-sm transition-all duration-200 ${stateClasses} ${alignRight ? "ml-auto" : "mr-auto"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${
            isCompleted
              ? "bg-emerald-500 text-white"
              : isUnlocked
                ? "bg-indigo-500 text-white"
                : "bg-slate-300 text-slate-600"
          }`}
        >
          {statusIcon}
        </div>

        <div>
          <p className="text-sm font-bold leading-5">{lesson.title}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] opacity-80">
            {lesson.totalQuestions} câu hỏi
          </p>
        </div>
      </div>

      <div className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
        {isCompleted ? "done" : isLocked ? "locked" : "ready"}
      </div>
    </button>
  );
}
