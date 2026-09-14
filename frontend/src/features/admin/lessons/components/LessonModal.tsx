"use client";

import { LessonDto, LessonType } from "@/features/admin/lessons/types/lesson";

interface LessonModalProps {
  isOpen: boolean;
  editingLesson: LessonDto | null;
  title: string;
  setTitle: (title: string) => void;
  lessonType: LessonType;
  setLessonType: (type: LessonType) => void;
  orderIndex: number;
  setOrderIndex: (orderIndex: number) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LessonModal({
  isOpen,
  editingLesson,
  title,
  setTitle,
  lessonType,
  setLessonType,
  orderIndex,
  setOrderIndex,
  isSubmitting,
  onClose,
  onSubmit,
}: LessonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">
          {editingLesson ? "Sửa Lesson" : "Thêm Lesson Mới"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề bài học
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loại bài học
            </label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              <option value={LessonType.Vocabulary}>
                Từ Vựng (Vocabulary)
              </option>
              <option value={LessonType.Grammar}>Ngữ Pháp (Grammar)</option>
              <option value={LessonType.Combined}>Tổng Hợp (Combined)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thứ tự (OrderIndex)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
