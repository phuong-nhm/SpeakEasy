"use client";

import { useState } from "react";
import {
  SentenceExerciseDto,
  CreateUpdateSentenceExerciseDto,
  SectionType,
  ExerciseType,
  FilterOption,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface SentenceExerciseModalProps {
  isOpen: boolean;
  editingExercise: SentenceExerciseDto | null;
  selectedLessonId: string;
  lessons: FilterOption[];
  onClose: () => void;
  onSubmit: (input: CreateUpdateSentenceExerciseDto) => void;
}

const defaultFormData: CreateUpdateSentenceExerciseDto = {
  lessonId: "",
  sectionType: SectionType.Grammar,
  exerciseType: ExerciseType.WordOrder,
  correctSentence: "",
  audioUrl: "",
  promptText: "",
  vietnameseTranslation: "",
};

// Helper để tạo initial data an toàn
function getInitialFormData(
  editingExercise: SentenceExerciseDto | null,
  selectedLessonId: string,
): CreateUpdateSentenceExerciseDto {
  if (editingExercise) {
    return {
      lessonId: editingExercise.lessonId,
      sectionType: editingExercise.sectionType,
      exerciseType: editingExercise.exerciseType,
      correctSentence: editingExercise.correctSentence || "",
      audioUrl: editingExercise.audioUrl || "",
      promptText: editingExercise.promptText || "",
      vietnameseTranslation: editingExercise.vietnameseTranslation || "",
    };
  }
  return {
    ...defaultFormData,
    lessonId: selectedLessonId,
  };
}

export function SentenceExerciseModal({
  isOpen,
  editingExercise,
  selectedLessonId,
  lessons,
  onClose,
  onSubmit,
}: SentenceExerciseModalProps) {
  // Pattern "Adjusting state during rendering":
  // Lưu giữ vết của props nhận được trước đó để phát hiện sự thay đổi mà không cần useEffect
  const [prevProps, setPrevProps] = useState({
    editingExercise,
    selectedLessonId,
    isOpen,
  });
  const [formData, setFormData] = useState<CreateUpdateSentenceExerciseDto>(
    () => getInitialFormData(editingExercise, selectedLessonId),
  );

  // Nếu props thay đổi (mở modal mới hoặc đổi bài tập edit khác), cập nhật state ngay trong luồng render
  if (
    prevProps.editingExercise !== editingExercise ||
    prevProps.selectedLessonId !== selectedLessonId ||
    prevProps.isOpen !== isOpen
  ) {
    setPrevProps({ editingExercise, selectedLessonId, isOpen });
    setFormData(getInitialFormData(editingExercise, selectedLessonId));
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.correctSentence.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          {editingExercise
            ? "Cập nhật Bài tập xếp câu"
            : "Thêm Bài tập xếp câu mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lesson Select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Lesson
            </label>
            <select
              value={formData.lessonId}
              onChange={(e) =>
                setFormData({ ...formData, lessonId: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {lessons.map((les) => (
                <option key={les.id} value={les.id}>
                  {les.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Section Type Select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phần bài học (Section)
              </label>
              <select
                value={formData.sectionType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sectionType: Number(e.target.value) as SectionType,
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value={SectionType.Vocabulary}>Vocabulary</option>
                <option value={SectionType.Grammar}>Grammar</option>
                <option value={SectionType.Review}>Review</option>
              </select>
            </div>

            {/* Exercise Type Select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Dạng bài tập (Exercise Type)
              </label>
              <select
                value={formData.exerciseType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    exerciseType: Number(e.target.value) as ExerciseType,
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value={ExerciseType.WordOrder}>Xếp từ thành câu</option>
                <option value={ExerciseType.FillInBlank}>Điền chỗ trống</option>
                <option value={ExerciseType.AnswerQuestion}>
                  Trả lời câu hỏi
                </option>
                <option value={ExerciseType.TranslateFromVietnamese}>
                  Dịch Việt - Anh
                </option>
              </select>
            </div>
          </div>

          {/* Prompt Text */}
          {formData.exerciseType === ExerciseType.AnswerQuestion && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Câu hỏi gợi ý (Prompt Text){" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.promptText}
                onChange={(e) =>
                  setFormData({ ...formData, promptText: e.target.value })
                }
                placeholder="Ví dụ: How are you today?"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Vietnamese Translation */}
          {formData.exerciseType === ExerciseType.TranslateFromVietnamese && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Bản dịch tiếng Việt gợi ý{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.vietnameseTranslation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vietnameseTranslation: e.target.value,
                  })
                }
                placeholder="Ví dụ: Rất vui được gặp bạn"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Correct Sentence Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Câu tiếng Anh chuẩn (Correct Sentence){" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.correctSentence}
              onChange={(e) =>
                setFormData({ ...formData, correctSentence: e.target.value })
              }
              placeholder="Ví dụ: Nice to meet you"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {formData.exerciseType === ExerciseType.FillInBlank && (
              <p className="mt-1 text-xs text-amber-600">
                * Lưu ý: Hệ thống backend sẽ tự xử lý khuyết từ dựa trên câu
                chuẩn này.
              </p>
            )}
          </div>

          {/* Audio URL Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Audio URL (Tùy chọn)
            </label>
            <input
              type="text"
              value={formData.audioUrl}
              onChange={(e) =>
                setFormData({ ...formData, audioUrl: e.target.value })
              }
              placeholder="https://example.com/audio.mp3"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editingExercise ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
