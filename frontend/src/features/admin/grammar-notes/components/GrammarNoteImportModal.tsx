"use client";

interface GrammarNoteImportModalProps {
  isOpen: boolean;
  jsonText: string;
  onJsonTextChange: (value: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const sampleJson = `[
  {
    "lessonId": "00000000-0000-0000-0000-000000000001",
    "title": "To Be",
    "usageNote": "Dùng để giới thiệu thông tin cơ bản",
    "structures": [
      {
        "formType": 0,
        "formula": "S + am/is/are + N/Adj",
        "example": "She is a teacher.",
        "orderIndex": 1
      },
      {
        "formType": 1,
        "formula": "S + am/is/are + not + N/Adj",
        "example": "He is not at home.",
        "orderIndex": 2
      }
    ]
  }
]`;

export function GrammarNoteImportModal({
  isOpen,
  jsonText,
  onJsonTextChange,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: GrammarNoteImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Nhập Grammar Note Hàng Loạt
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dán JSON mảng CreateUpdateGrammarNoteDto để tạo nhiều Grammar Note
            cùng lúc.
          </p>
        </div>

        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            Xem mẫu JSON
          </summary>
          <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
            {sampleJson}
          </pre>
        </details>

        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={jsonText}
            onChange={(e) => onJsonTextChange(e.target.value)}
            rows={14}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
            placeholder="Dán JSON mảng tại đây..."
            required
          />

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Đang import..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
