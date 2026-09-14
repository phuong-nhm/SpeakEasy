interface Lesson {
  id: string;
  title: string;
}

interface LessonFilterProps {
  lessons: Lesson[];
  selectedLessonId: string;
  onLessonChange: (lessonId: string) => void;
}

export function LessonFilter({
  lessons,
  selectedLessonId,
  onLessonChange,
}: LessonFilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
      <label className="text-sm font-semibold text-slate-700">
        Chọn Bài học (Lesson):
      </label>
      <select
        value={selectedLessonId}
        onChange={(e) => onLessonChange(e.target.value)}
        className="w-full min-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
      >
        {lessons.length === 0 ? (
          <option value="">Không có bài học nào</option>
        ) : (
          lessons.map((les) => (
            <option key={les.id} value={les.id}>
              {les.title}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
