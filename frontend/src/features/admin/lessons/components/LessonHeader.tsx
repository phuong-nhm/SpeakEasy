"use client";

import { LevelDto } from "@/features/admin/levels/types/level";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";

interface LessonHeaderProps {
  levels: LevelDto[];
  selectedLevelId: string;
  onLevelChange: (levelId: string) => void;
  chapters: ChapterDto[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;
  onOpenCreateModal: () => void;
}

export function LessonHeader({
  levels,
  selectedLevelId,
  onLevelChange,
  chapters,
  selectedChapterId,
  onChapterChange,
  onOpenCreateModal,
}: LessonHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản Lý Lesson (Bài học)
          </h1>
          <p className="text-slate-500 text-sm">
            API Endpoint:{" "}
            <code className="bg-slate-200 px-1 rounded text-xs">
              /api/app/lesson
            </code>
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          disabled={!selectedChapterId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm Lesson
        </button>
      </div>

      {/* 2 Dropdown Cascade: Chọn Level -> Chọn Chapter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-slate-700">
            Chọn Level:
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => onLevelChange(e.target.value)}
            className="min-w-[200px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-slate-700">
            Chọn Chapter:
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => onChapterChange(e.target.value)}
            disabled={chapters.length === 0}
            className="min-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50"
          >
            {chapters.length > 0 ? (
              chapters.map((chap) => (
                <option key={chap.id} value={chap.id}>
                  {chap.title}
                </option>
              ))
            ) : (
              <option value="">-- Chưa có Chapter --</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
