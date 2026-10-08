import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LevelDto } from "@/features/admin/levels/types/level";

interface ListeningFilterBarProps {
  levels: LevelDto[];
  selectedLevelId: string;
  onLevelChange: (levelId: string) => void;
  chapters: ChapterDto[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;
}

export function ListeningFilterBar({
  levels,
  selectedLevelId,
  onLevelChange,
  chapters,
  selectedChapterId,
  onChapterChange,
}: ListeningFilterBarProps) {
  return (
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
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
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
            chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))
          ) : (
            <option value="">-- Chưa có Chapter --</option>
          )}
        </select>
      </div>
    </div>
  );
}
