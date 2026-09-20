import { LessonDto } from "@/features/admin/lessons/types/lesson";

interface GrammarNoteFilterBarProps {
  lessons: LessonDto[];
  selectedLessonId: string;
  onLessonChange: (lessonId: string) => void;
}

export function GrammarNoteFilterBar({
  lessons,
  selectedLessonId,
  onLessonChange,
}: GrammarNoteFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
      <label className="text-sm font-semibold text-slate-700">
        Chọn Lesson:
      </label>
      <select
        value={selectedLessonId}
        onChange={(e) => onLessonChange(e.target.value)}
        className="w-full min-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
      >
        {lessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.title}
          </option>
        ))}
      </select>
    </div>
  );
}
