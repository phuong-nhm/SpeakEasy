"use client";

import { useState } from "react";

import { CreateUpdateSentenceExerciseDto } from "@/features/admin/sentence-exercises/types/sentence-exercise";

interface SentenceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    rawItems: Omit<CreateUpdateSentenceExerciseDto, "lessonId">[],
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

      const rawItems = parsed as Omit<
        CreateUpdateSentenceExerciseDto,
        "lessonId"
      >[];

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
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            Import Bài Tập Câu Hàng Loạt (JSON)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-500">
            Dán danh sách bài tập câu dạng JSON array. Ví dụ:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs font-mono text-emerald-400">
            {`[
  {
    "sectionType": 1,
    "exerciseType": 0,
    "correctSentence": "My name is John Smith"
  },
  {
    "sectionType": 1,
    "exerciseType": 2,
    "correctSentence": "I am fine thank you",
    "promptText": "How are you today?"
  },
  {
    "sectionType": 0,
    "exerciseType": 3,
    "correctSentence": "Nice to meet you",
    "vietnameseTranslation": "Rất vui được gặp bạn"
  }
]`}
          </pre>

          <div className="text-xs text-slate-500">
            <p>* Enum sectionType: 0 (Vocabulary), 1 (Grammar), 2 (Review)</p>
            <p>
              * Enum exerciseType: 0 (WordOrder), 1 (FillInBlank), 2
              (AnswerQuestion - yêu cầu promptText), 3 (TranslateFromVietnamese
              - yêu cầu vietnameseTranslation)
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
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
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {jsonError}
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-3 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || !jsonInput.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang Import..." : "Xác nhận Import"}
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
