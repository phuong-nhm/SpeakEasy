import { ChapterDto } from "@/features/admin/chapters/types/chapter";

interface ListeningFilterBarProps {
  chapters: ChapterDto[];
  selectedChapterId: string;
  onChapterChange: (chapterId: string) => void;
}

export function ListeningFilterBar({
  chapters,
  selectedChapterId,
  onChapterChange,
}: ListeningFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
      <label className="text-sm font-semibold text-slate-700">
        Chọn Chapter:
      </label>
      <select
        value={selectedChapterId}
        onChange={(e) => onChapterChange(e.target.value)}
        className="w-full min-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
      >
        {chapters.map((chapter) => (
          <option key={chapter.id} value={chapter.id}>
            {chapter.title}
          </option>
        ))}
      </select>
    </div>
  );
}
