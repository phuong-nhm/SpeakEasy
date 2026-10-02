"use client";

import { LevelDto } from "@/features/admin/levels/types/level";

interface WritingTopicFilterProps {
  levels: LevelDto[];
  selectedLevelId: string;
  onSelectLevel: (levelId: string) => void;
}

export function WritingTopicFilter({
  levels,
  selectedLevelId,
  onSelectLevel,
}: WritingTopicFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Chọn Level:
        </label>
        <select
          value={selectedLevelId}
          onChange={(e) => onSelectLevel(e.target.value)}
          className="min-w-[200px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
        >
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
