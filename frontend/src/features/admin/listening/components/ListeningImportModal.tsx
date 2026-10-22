"use client";

import { useState } from "react";

import { CreateUpdateListeningPassageDto } from "@/features/admin/listening/types/listening";

interface ListeningImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: CreateUpdateListeningPassageDto[]) => Promise<void>;
  isSubmitting: boolean;
}

function ListeningImportModalContent({
  onClose,
  onImport,
  isSubmitting,
}: Omit<ListeningImportModalProps, "isOpen">) {
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

      await onImport(parsed as CreateUpdateListeningPassageDto[]);
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
      <div className="max-h-[92vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Nhập Listening Passage Hàng Loạt
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dán JSON mảng Passage (mỗi Passage ứng với 1 Chapter khác nhau, có
            mảng Questions con) để tạo nhiều bài nghe cùng lúc.
          </p>
        </div>

        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Xem mẫu JSON
          </summary>
          <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
            {`[
  {
    "chapterId": "00000000-0000-0000-0000-000000000001",
    "title": "Ordering at the cafe",
    "transcript": "Hello, welcome to our cafe...",
    "questions": [
      {
        "questionType": 0,
        "questionText": "What did the customer order?",
        "optionA": "Coffee",
        "optionB": "Tea",
        "optionC": "Juice",
        "optionD": "Water",
        "correctOptionKey": "A",
        "orderIndex": 1
      },
      {
        "questionType": 1,
        "questionText": "Summarize the conversation in your own words.",
        "orderIndex": 2
      }
    ]
  }
]`}
          </pre>
          <div className="mt-3 text-xs text-slate-500">
            <p>
              * chapterId: mỗi Passage ứng với 1 Chapter khác nhau, không trùng
              nhau trong 1 lần import, và Chapter đó chưa có Passage nào.
            </p>
            <p>
              * title, transcript: bắt buộc. audioUrl: để trống thì hệ thống tự
              sinh TTS từ transcript.
            </p>
            <p>* questionType: 0 = MultipleChoice, 1 = Essay</p>
            <p>
              * MultipleChoice bắt buộc optionA-D và correctOptionKey. Essay chỉ
              cần questionText.
            </p>
          </div>
        </details>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Chuỗi dữ liệu JSON
          </label>
          <textarea
            rows={12}
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

export function ListeningImportModal({
  isOpen,
  ...props
}: ListeningImportModalProps) {
  if (!isOpen) return null;

  return <ListeningImportModalContent {...props} />;
}
