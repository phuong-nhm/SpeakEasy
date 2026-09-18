"use client";

import { ChapterDto } from "../types/roadmap";
import Link from "next/link";

interface ChapterCardProps {
  chapter: ChapterDto;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChapterCard({
  chapter,
  isSelected = false,
  onClick,
}: ChapterCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick && onClick();
      }}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 ${
        isSelected
          ? "border-indigo-300 bg-indigo-50 shadow-indigo-100"
          : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-slate-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Chapter {chapter.order}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {chapter.title}
          </h3>
        </div>
        <div
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            isSelected
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {chapter.lessons.length} lessons
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {chapter.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {chapter.lessons && chapter.lessons.length > 0 && (
          <Link
            href={`/lesson/${chapter.lessons[0].id}`}
            className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Mở Lesson
          </Link>
        )}

        <Link
          href={`/lesson/listening/${chapter.id}`}
          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          Listening
        </Link>

        <Link
          href={`/lesson/writing/${chapter.id}`}
          className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
        >
          Writing AI
        </Link>

        <Link
          href={`/lesson/checkpoint/${chapter.id}`}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Checkpoint
        </Link>
      </div>
    </div>
  );
}
