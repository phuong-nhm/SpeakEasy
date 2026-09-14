"use client";

import {
  SentenceExerciseDto,
  SectionTypeLabels,
  ExerciseTypeLabels,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface SentenceExerciseTableProps {
  exercises: SentenceExerciseDto[];
  loading: boolean;
  onEdit: (exercise: SentenceExerciseDto) => void;
  onDelete: (id: string) => void;
}

export function SentenceExerciseTable({
  exercises,
  loading,
  onEdit,
  onDelete,
}: SentenceExerciseTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Đang tải dữ liệu bài tập...
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Chưa có bài tập nào cho Lesson này. Vui lòng bấm &quot;+ Thêm Bài tập
        mới&quot;.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">STT</th>
            <th className="px-6 py-3">Phần &amp; Dạng bài</th>
            <th className="px-6 py-3">Câu chuẩn (Correct Sentence)</th>
            <th className="px-6 py-3">Thông tin bổ sung</th>
            <th className="px-6 py-3 text-center">Audio</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {exercises.map((exercise, index) => {
            const sectionMeta = SectionTypeLabels[exercise.sectionType];
            const exerciseMeta = ExerciseTypeLabels[exercise.exerciseType];

            return (
              <tr key={exercise.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-400">
                  {index + 1}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${sectionMeta.color}`}
                    >
                      {sectionMeta.label}
                    </span>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${exerciseMeta.color}`}
                    >
                      {exerciseMeta.label}
                    </span>
                  </div>
                </td>

                <td className="max-w-xs px-6 py-4 font-medium text-slate-800">
                  {exercise.correctSentence}
                </td>

                <td className="max-w-xs px-6 py-4 text-xs text-slate-500">
                  {exercise.promptText && (
                    <div>
                      <span className="font-semibold text-slate-700">Q:</span>{" "}
                      {exercise.promptText}
                    </div>
                  )}
                  {exercise.vietnameseTranslation && (
                    <div>
                      <span className="font-semibold text-slate-700">VN:</span>{" "}
                      {exercise.vietnameseTranslation}
                    </div>
                  )}
                  {!exercise.promptText && !exercise.vietnameseTranslation && (
                    <span className="italic text-slate-400">Không có</span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {exercise.audioUrl ? (
                    <audio
                      controls
                      src={exercise.audioUrl}
                      className="mx-auto h-8 w-36"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Không</span>
                  )}
                </td>

                <td className="space-x-2 px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(exercise)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(exercise.id)}
                    className="font-medium text-rose-600 hover:text-rose-800"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
