"use client";

import { useEffect, useState } from "react";
import { LessonDto } from "@/features/admin/lessons/types/lesson";
import { SentenceExerciseDto } from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface ListeningDialogueModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  lessons: LessonDto[];
  editingDialogue: SentenceExerciseDto | null;
  onClose: () => void;
  onSubmit: (input: {
    lessonId: string;
    correctSentence: string;
    distractorSentence: string;
    dialogueGroupId: string;
    orderInGroup: number;
  }) => Promise<void> | void;
}

interface FormState {
  lessonId: string;
  correctSentence: string;
  distractorSentence: string;
  dialogueGroupId: string;
  orderInGroup: number;
}

const buildUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

const createInitialState = (
  editingDialogue: SentenceExerciseDto | null,
  defaultLessonId: string,
): FormState => {
  if (editingDialogue) {
    return {
      lessonId: editingDialogue.lessonId,
      correctSentence: editingDialogue.correctSentence || "",
      distractorSentence: editingDialogue.distractorSentence || "",
      dialogueGroupId: editingDialogue.dialogueGroupId || buildUuid(),
      orderInGroup: editingDialogue.orderInGroup ?? 1,
    };
  }

  return {
    lessonId: defaultLessonId,
    correctSentence: "",
    distractorSentence: "",
    dialogueGroupId: buildUuid(),
    orderInGroup: 1,
  };
};

export function ListeningDialogueModal({
  isOpen,
  isSubmitting,
  lessons,
  editingDialogue,
  onClose,
  onSubmit,
}: ListeningDialogueModalProps) {
  const [formData, setFormData] = useState<FormState>(() =>
    createInitialState(editingDialogue, lessons[0]?.id || ""),
  );
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(createInitialState(editingDialogue, lessons[0]?.id || ""));
    setErrorText("");
  }, [editingDialogue, isOpen, lessons]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.lessonId.trim()) {
      setErrorText("Vui lòng chọn Lesson cho dialogue sentence.");
      return;
    }

    if (!formData.correctSentence.trim()) {
      setErrorText("CorrectSentence là bắt buộc.");
      return;
    }

    if (!formData.distractorSentence.trim()) {
      setErrorText("DistractorSentence là bắt buộc.");
      return;
    }

    if (!formData.dialogueGroupId.trim()) {
      setErrorText("DialogueGroupId là bắt buộc.");
      return;
    }

    if (formData.orderInGroup !== 1 && formData.orderInGroup !== 2) {
      setErrorText("OrderInGroup chỉ nhận 1 hoặc 2.");
      return;
    }

    setErrorText("");
    await onSubmit({
      lessonId: formData.lessonId,
      correctSentence: formData.correctSentence.trim(),
      distractorSentence: formData.distractorSentence.trim(),
      dialogueGroupId: formData.dialogueGroupId.trim(),
      orderInGroup: formData.orderInGroup,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingDialogue
                ? "Cập nhật Listening Dialogue"
                : "Thêm Listening Dialogue"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dialogue sử dụng SentenceExercise với ExerciseType=ListenChoose.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorText ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorText}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Lesson
            </label>
            <select
              value={formData.lessonId}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  lessonId: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.orderIndex}. {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                DialogueGroupId
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.dialogueGroupId}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      dialogueGroupId: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
                  placeholder="UUID"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      dialogueGroupId: buildUuid(),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                OrderInGroup
              </label>
              <input
                type="number"
                min={1}
                max={2}
                value={formData.orderInGroup}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    orderInGroup: Number(event.target.value || 1),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Chỉ dùng 1 hoặc 2.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                SectionType
              </label>
              <input
                readOnly
                value="Dialogue (3)"
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                AudioUrl
              </label>
              <input
                readOnly
                value={editingDialogue?.audioUrl || "(auto-generate backend)"}
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              CorrectSentence
            </label>
            <textarea
              rows={3}
              value={formData.correctSentence}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  correctSentence: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              placeholder="Could you speak slower?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              DistractorSentence
            </label>
            <textarea
              rows={3}
              value={formData.distractorSentence}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  distractorSentence: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none"
              placeholder="Could you speak louder?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
