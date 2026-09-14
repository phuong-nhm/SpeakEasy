"use client";

import { FilterOption } from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface CascadingFilterProps {
  levels: FilterOption[];
  selectedLevelId: string;
  onLevelChange: (levelId: string) => void;

  chapters: FilterOption[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;

  lessons: FilterOption[];
  selectedLessonId: string;
  onLessonChange: (lessonId: string) => void;
}

export function CascadingFilter({
  levels,
  selectedLevelId,
  onLevelChange,
  chapters,
  selectedChapterId,
  onChapterChange,
  lessons,
  selectedLessonId,
  onLessonChange,
}: CascadingFilterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Level Filter */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            1. Khóa học (Level)
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.title}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Filter */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            2. Chương (Chapter)
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => onChapterChange(e.target.value)}
            disabled={chapters.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Filter */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            3. Bài học (Lesson)
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => onLessonChange(e.target.value)}
            disabled={lessons.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50"
          >
            {lessons.map((les) => (
              <option key={les.id} value={les.id}>
                {les.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
