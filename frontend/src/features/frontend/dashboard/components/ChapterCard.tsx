import { ChapterDto } from "../types/roadmap";

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
    <button
      type="button"
      onClick={onClick}
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
    </button>
  );
}
