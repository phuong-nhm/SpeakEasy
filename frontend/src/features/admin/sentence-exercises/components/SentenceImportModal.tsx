"use client";

import { useState } from "react";

import { CreateUpdateSentenceExerciseDto } from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface SentenceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    rawItems: (Omit<CreateUpdateSentenceExerciseDto, "lessonId"> & {
      lessonId?: string;
    })[],
  ) => Promise<void>;
  isSubmitting: boolean;
}

function SentenceImportModalContent({
  onClose,
  onImport,
  isSubmitting,
}: Omit<SentenceImportModalProps, "isOpen">) {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleImport = async () => {
    setJsonError(null);

    try {
      const parsed = JSON.parse(jsonInput) as unknown;

      if (!Array.isArray(parsed)) {
        setJsonError("Dữ liệu JSON phải là một mảng []!");
        return;
      }

      const rawItems = parsed as (Omit<
        CreateUpdateSentenceExerciseDto,
        "lessonId"
      > & {
        lessonId?: string;
      })[];

      await onImport(rawItems);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cú pháp JSON không hợp lệ! Vui lòng kiểm tra lại.";

      const isJsonSyntaxError =
        message.includes("JSON") ||
        message.includes("Unexpected") ||
        message.includes("parse");

      setJsonError(
        isJsonSyntaxError
          ? "Cú pháp JSON không hợp lệ! Vui lòng kiểm tra lại."
          : message,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Nhập Bài Tập Xếp Câu Hàng Loạt
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dán JSON mảng CreateUpdateSentenceExerciseDto để tạo nhiều bài tập
            cùng lúc.
          </p>
        </div>

        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Xem mẫu JSON
          </summary>
          <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
            {`[
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 1,
    "exerciseType": 0,
    "correctSentence": "My name is John Smith"
  },
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 1,
    "exerciseType": 2,
    "correctSentence": "I am fine, thank you.",
    "promptText": "How are you today?"
  },
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 0,
    "exerciseType": 3,
    "correctSentence": "Nice to meet you",
    "vietnameseTranslation": "Rất vui được gặp bạn"
  },
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "sectionType": 2,
    "exerciseType": 4,
    "correctSentence": "Could you speak a little slower, please?",
    "audioUrl": "https://example.com/audio/line-1.mp3",
    "distractorSentence": "Could you speak a little louder, please?",
    "dialogueGroupId": "00000000-0000-0000-0000-000000000123",
    "orderInGroup": 1
  }
]`}
          </pre>
          <div className="mt-3 text-xs text-slate-500">
            <p>* lessonId: nên truyền theo từng item để đúng DTO backend.</p>
            <p>* sectionType: 0 = Vocabulary, 1 = Grammar, 2 = Review</p>
            <p>
              * exerciseType: 0 = WordOrder, 1 = FillInBlank, 2 =
              AnswerQuestion, 3 = TranslateFromVietnamese, 4 = ListenChoose
            </p>
            <p>* Bắt buộc: sectionType, exerciseType, correctSentence.</p>
            <p>* Nếu exerciseType = 2 thì cần promptText.</p>
            <p>* Nếu exerciseType = 3 thì cần vietnameseTranslation.</p>
            <p>* Nếu exerciseType = 4 thì cần distractorSentence.</p>
          </div>
        </details>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Chuỗi dữ liệu JSON
          </label>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            placeholder="Dán chuỗi JSON vào đây..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs font-mono text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        {jsonError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {jsonError}
          </div>
        )}

        <div className="flex justify-end space-x-3 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || !jsonInput.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang import..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SentenceImportModal({
  isOpen,
  ...props
}: SentenceImportModalProps) {
  if (!isOpen) return null;

  return <SentenceImportModalContent {...props} />;
}
