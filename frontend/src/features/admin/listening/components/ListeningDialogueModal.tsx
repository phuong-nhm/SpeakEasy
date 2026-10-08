"use client";

import { useEffect, useState } from "react";
import { LessonDto } from "@/features/admin/lessons/types/lesson";
import {
  CreateUpdateSentenceExerciseDto,
  SentenceExerciseDto,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface ListeningDialogueModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  lessons: LessonDto[];
  editingDialogue: SentenceExerciseDto | null;
  onClose: () => void;
  onSubmit: (input: {
    lessonId: string;
    partACorrectSentence: string;
    partADistractorSentence: string;
    partBCorrectSentence: string;
    partBVietnameseTranslation: string;
  }) => Promise<void> | void;
  onImport: (
    rawItems: (Omit<CreateUpdateSentenceExerciseDto, "lessonId"> & {
      lessonId?: string;
    })[],
  ) => Promise<number>;
}

type ModalTab = "single" | "import";

interface SingleFormState {
  lessonId: string;
  partACorrectSentence: string;
  partADistractorSentence: string;
  partBCorrectSentence: string;
  partBVietnameseTranslation: string;
}

const createInitialState = (
  editingDialogue: SentenceExerciseDto | null,
  defaultLessonId: string,
): SingleFormState => {
  if (editingDialogue) {
    return {
      lessonId: editingDialogue.lessonId,
      partACorrectSentence: editingDialogue.correctSentence || "",
      partADistractorSentence: editingDialogue.distractorSentence || "",
      partBCorrectSentence: "",
      partBVietnameseTranslation: "",
    };
  }

  return {
    lessonId: defaultLessonId,
    partACorrectSentence: "",
    partADistractorSentence: "",
    partBCorrectSentence: "",
    partBVietnameseTranslation: "",
  };
};

export function ListeningDialogueModal({
  isOpen,
  isSubmitting,
  lessons,
  editingDialogue,
  onClose,
  onSubmit,
  onImport,
}: ListeningDialogueModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("single");
  const [formData, setFormData] = useState<SingleFormState>(() =>
    createInitialState(editingDialogue, lessons[0]?.id || ""),
  );
  const [singleErrorText, setSingleErrorText] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [importErrorText, setImportErrorText] = useState("");

  // useEffect(() => {
  //   if (!isOpen) {
  //     return;
  //   }

  //   setActiveTab("single");
  //   setFormData(createInitialState(editingDialogue, lessons[0]?.id || ""));
  //   setSingleErrorText("");
  //   setJsonInput("");
  //   setImportErrorText("");
  // }, [editingDialogue, isOpen, lessons]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Lấy lessonId đầu tiên tại thời điểm mở Modal
    const defaultLessonId = lessons[0]?.id || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab("single");
    setFormData(createInitialState(editingDialogue, defaultLessonId));
    setSingleErrorText("");
    setJsonInput("");
    setImportErrorText("");

    // 👈 CHỈ lắng nghe khi Modal đóng/mở (isOpen) hoặc khi đổi Dialogue đang sửa
  }, [isOpen, editingDialogue?.id]);

  if (!isOpen) {
    return null;
  }

  const handleSingleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.lessonId.trim()) {
      setSingleErrorText("Vui lòng chọn Lesson cho dialogue.");
      return;
    }

    if (!formData.partACorrectSentence.trim()) {
      setSingleErrorText("Part A: CorrectSentence là bắt buộc.");
      return;
    }

    if (!formData.partADistractorSentence.trim()) {
      setSingleErrorText("Part A: DistractorSentence là bắt buộc.");
      return;
    }

    if (!formData.partBCorrectSentence.trim()) {
      setSingleErrorText("Part B: CorrectSentence là bắt buộc.");
      return;
    }

    if (!formData.partBVietnameseTranslation.trim()) {
      setSingleErrorText("Part B: VietnameseTranslation là bắt buộc.");
      return;
    }

    setSingleErrorText("");
    await onSubmit({
      lessonId: formData.lessonId,
      partACorrectSentence: formData.partACorrectSentence.trim(),
      partADistractorSentence: formData.partADistractorSentence.trim(),
      partBCorrectSentence: formData.partBCorrectSentence.trim(),
      partBVietnameseTranslation: formData.partBVietnameseTranslation.trim(),
    });
  };

  const handleImportJson = async () => {
    setImportErrorText("");

    if (!jsonInput.trim()) {
      setImportErrorText("Vui lòng dán JSON trước khi import.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput) as unknown;
      if (!Array.isArray(parsed)) {
        setImportErrorText("Dữ liệu JSON phải là một mảng [].");
        return;
      }

      const importedCount = await onImport(
        parsed as (Omit<CreateUpdateSentenceExerciseDto, "lessonId"> & {
          lessonId?: string;
        })[],
      );

      alert(`Import thành công ${importedCount} bản ghi dialogue.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại.";

      const isJsonSyntaxError =
        message.includes("JSON") ||
        message.includes("Unexpected") ||
        message.includes("parse");

      setImportErrorText(
        isJsonSyntaxError
          ? "Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại."
          : message,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingDialogue
                ? "Cập nhật Listening Dialogue"
                : "Thêm Listening Dialogue"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hỗ trợ thêm từng cặp A+B hoặc import JSON hàng loạt.
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

        <div className="mb-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "single"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Single Pair (A+B)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === "import"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Import JSON
          </button>
        </div>

        {activeTab === "single" ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            {singleErrorText ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {singleErrorText}
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
                  value="(auto-generate backend)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Part A - Nghe & Chọn
                </h3>
                <input
                  readOnly
                  value="ExerciseType: ListenChoose (4)"
                  className="w-56 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  CorrectSentence
                </label>
                <textarea
                  rows={3}
                  value={formData.partACorrectSentence}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      partACorrectSentence: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="Could you speak slower?"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  DistractorSentence
                </label>
                <textarea
                  rows={3}
                  value={formData.partADistractorSentence}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      partADistractorSentence: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="Could you speak louder?"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Part B - Dịch & Trả lời
                </h3>
                <input
                  readOnly
                  value="ExerciseType: TranslateFromVietnamese (3)"
                  className="w-72 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  CorrectSentence
                </label>
                <textarea
                  rows={3}
                  value={formData.partBCorrectSentence}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      partBCorrectSentence: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="Yes, of course."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  VietnameseTranslation
                </label>
                <textarea
                  rows={3}
                  value={formData.partBVietnameseTranslation}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      partBVietnameseTranslation: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none"
                  placeholder="Vâng, được."
                />
              </div>
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
        ) : (
          <div className="space-y-4">
            <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                Xem mẫu JSON Import Dialogue
              </summary>
              <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                {`[
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 3,
    "exerciseType": 4,
    "correctSentence": "Could you speak slower?",
    "distractorSentence": "Could you speak louder?",
    "dialogueGroupId": "auto",
    "orderInGroup": 1,
    "audioUrl": null
  },
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 3,
    "exerciseType": 3,
    "correctSentence": "Yes, of course.",
    "vietnameseTranslation": "Vâng, được.",
    "dialogueGroupId": "auto",
    "orderInGroup": 2,
    "audioUrl": null
  }
]`}
              </pre>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <p>* sectionType phải là 3 (Dialogue).</p>
                <p>
                  * exerciseType hỗ trợ 4 (ListenChoose) và 3
                  (TranslateFromVietnamese).
                </p>
                <p>
                  * dialogueGroupId = `auto` sẽ được thay bằng cùng 1 UUID ở
                  frontend.
                </p>
                <p>* audioUrl: null hoặc rỗng để backend tự generate.</p>
              </div>
            </details>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                JSON Input
              </label>
              <textarea
                rows={12}
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                placeholder="Dán JSON mảng vào đây..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            {importErrorText ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {importErrorText}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={isSubmitting || !jsonInput.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang import..." : "Import"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
