"use client";

import { LevelDto } from "@/features/admin/levels/types/level";
import { ChapterOption } from "@/features/admin/writing-topics/types/writing-topic";

interface WritingTopicFilterProps {
  levels: LevelDto[];
  selectedLevelId: string;
  onSelectLevel: (levelId: string) => void;
  chapters: ChapterOption[];
  selectedChapterId: string;
  onSelectChapter: (chapterId: string) => void;
}

export function WritingTopicFilter({
  levels,
  selectedLevelId,
  onSelectLevel,
  chapters,
  selectedChapterId,
  onSelectChapter,
}: WritingTopicFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* Level Select */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Chọn Level:
        </label>
        <select
          value={selectedLevelId}
          onChange={(e) => onSelectLevel(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none min-w-[200px]"
        >
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter Select */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Chọn Chapter:
        </label>
        <select
          value={selectedChapterId}
          onChange={(e) => onSelectChapter(e.target.value)}
          disabled={chapters.length === 0}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none min-w-[240px] disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          {chapters.length === 0 ? (
            <option value="">-- Chưa có Chapter nào --</option>
          ) : (
            chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
