"use client";

import Link from "next/link";

import { RoadmapChapterView } from "../types/roadmap";

interface ChapterCardProps {
  chapter: RoadmapChapterView;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChapterCard({
  chapter,
  isSelected = false,
  onClick,
}: ChapterCardProps) {
  const isLocked = chapter.status === "locked";
  const firstUnlockedLesson = chapter.lessons.find(
    (lesson) => lesson.status !== "locked",
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={isLocked ? undefined : onClick}
      onKeyDown={(e) => {
        if (!isLocked && (e.key === "Enter" || e.key === " ")) {
          onClick && onClick();
        }
      }}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 ${
        isLocked
          ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
          : isSelected
            ? "border-indigo-300 bg-indigo-50 shadow-indigo-100"
            : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Chapter {chapter.orderIndex}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {chapter.title}
          </h3>
        </div>
        <div
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLocked
              ? "bg-slate-200 text-slate-500"
              : isSelected
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {isLocked ? "🔒 Locked" : `${chapter.lessons.length} lessons`}
        </div>
      </div>

      {!isLocked && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {firstUnlockedLesson && (
            <Link
              href={`/lesson/${firstUnlockedLesson.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Mở Lesson
            </Link>
          )}

          <Link
            href={`/lesson/listening/${chapter.id}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Listening
          </Link>

          <Link
            href={`/lesson/writing/${chapter.id}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
          >
            Writing AI
          </Link>

          <Link
            href={`/lesson/checkpoint/${chapter.id}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Checkpoint
          </Link>
        </div>
      )}
    </div>
  );
}
