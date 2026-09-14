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
        className="px-4 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
