"use client";

import {
  GrammarFormType,
  GrammarNoteDto,
  GrammarStructureItemDto,
} from "@/features/admin/grammar-notes/types/grammar-note";
import { LessonDto } from "@/features/admin/lessons/types/lesson";

interface GrammarNoteModalProps {
  isOpen: boolean;
  editingNote: GrammarNoteDto | null;
  lessons: LessonDto[];
  lessonId: string;
  setLessonId: (lessonId: string) => void;
  title: string;
  setTitle: (title: string) => void;
  usageNote: string;
  setUsageNote: (value: string) => void;
  structures: GrammarStructureItemDto[];
  onStructureFieldChange: (
    index: number,
    field: keyof GrammarStructureItemDto,
    value: string,
  ) => void;
  onAddStructure: () => void;
  onRemoveStructure: (index: number) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function GrammarNoteModal({
  isOpen,
  editingNote,
  lessons,
  lessonId,
  setLessonId,
  title,
  setTitle,
  usageNote,
  setUsageNote,
  structures,
  onStructureFieldChange,
  onAddStructure,
  onRemoveStructure,
  isSubmitting,
  onClose,
  onSubmit,
}: GrammarNoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          {editingNote ? "Sửa Grammar Note" : "Thêm Grammar Note Mới"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lesson
              </label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                required
              >
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="Ví dụ: To Be"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usage Note
            </label>
            <textarea
              value={usageNote}
              onChange={(e) => setUsageNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              placeholder="Mô tả cách dùng của cấu trúc ngữ pháp..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Structures</p>
              <button
                type="button"
                onClick={onAddStructure}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
              >
                + Thêm structure
              </button>
            </div>

            {structures.map((item, index) => (
              <div
                key={`${item.formType}-${index}`}
                className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Structure #{index + 1}
                  </span>
                  {structures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveStructure(index)}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Form Type
                    </label>
                    <select
                      value={item.formType}
                      onChange={(e) =>
                        onStructureFieldChange(
                          index,
                          "formType",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value={GrammarFormType.Affirmative}>
                        Affirmative
                      </option>
                      <option value={GrammarFormType.Negative}>Negative</option>
                      <option value={GrammarFormType.Question}>Question</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Formula
                    </label>
                    <input
                      type="text"
                      value={item.formula}
                      onChange={(e) =>
                        onStructureFieldChange(index, "formula", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                      placeholder="Subject + am/is/are + ..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Example
                  </label>
                  <input
                    type="text"
                    value={item.example}
                    onChange={(e) =>
                      onStructureFieldChange(index, "example", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                    placeholder="Ví dụ: I am a student."
                  />
                </div>
              </div>
            ))}
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
