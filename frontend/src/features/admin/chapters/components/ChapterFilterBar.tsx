import { LevelDto } from "@/features/admin/levels/types/level";

interface ChapterFilterBarProps {
  levels: LevelDto[];
  selectedLevelId: string;
  onLevelChange: (levelId: string) => void;
}

export function ChapterFilterBar({
  levels,
  selectedLevelId,
  onLevelChange,
}: ChapterFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
      <label className="text-sm font-semibold text-slate-700">
        Chọn Level:
      </label>
      <select
        value={selectedLevelId}
        onChange={(e) => onLevelChange(e.target.value)}
        className="w-full min-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
      >
        {levels.map((lvl) => (
          <option key={lvl.id} value={lvl.id}>
            {lvl.name}
          </option>
        ))}
      </select>
    </div>
  );
}
