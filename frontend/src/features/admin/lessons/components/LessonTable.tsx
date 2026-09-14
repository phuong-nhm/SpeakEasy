"use client";

import { LessonDto, LessonType } from "@/features/admin/lessons/types/lesson";

interface LessonTableProps {
  lessons: LessonDto[];
  isLoading: boolean;
  onOpenEditModal: (lesson: LessonDto) => void;
  onDelete: (id: string) => void;
}

export function LessonTable({
  lessons,
  isLoading,
  onOpenEditModal,
  onDelete,
}: LessonTableProps) {
  const renderLessonTypeBadge = (type: LessonType) => {
    switch (Number(type)) {
      case LessonType.Vocabulary:
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            Từ Vựng
          </span>
        );
      case LessonType.Grammar:
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            Ngữ Pháp
          </span>
        );
      case LessonType.Combined:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            Tổng Hợp
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Đang tải Lessons...
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Chưa có bài học nào trong Chapter này.
        </div>
      ) : (
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
            <tr>
              <th className="px-6 py-3.5">STT</th>
              <th className="px-6 py-3.5">Thứ tự</th>
              <th className="px-6 py-3.5">Tiêu đề bài học</th>
              <th className="px-6 py-3.5">Loại bài học (LessonType)</th>
              <th className="px-6 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.map((les, index) => (
              <tr key={les.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-bold text-blue-600">
                  #{les.orderIndex}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {les.title}
                </td>
                <td className="px-6 py-4">
                  {renderLessonTypeBadge(les.lessonType)}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onOpenEditModal(les)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(les.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
