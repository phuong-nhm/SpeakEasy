interface VocabularyImportModalProps {
  isOpen: boolean;
  jsonInput: string;
  setJsonInput: (val: string) => void;
  jsonError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onImport: () => void;
}

export function VocabularyImportModal({
  isOpen,
  jsonInput,
  setJsonInput,
  jsonError,
  isSubmitting,
  onClose,
  onImport,
}: VocabularyImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Nhập Từ Vựng Hàng Loạt
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dán JSON mảng CreateUpdateVocabularyDto để tạo nhiều từ vựng cùng
            lúc.
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
    "word": "Hello",
    "meaning": "Xin chào",
    "distractor": "Tạm biệt",
    "imageUrl": "https://example.com/images/hello.jpg",
    "audioUrl": "https://example.com/audio/hello.mp3",
    "wordType": 6
  },
  {
    "lessonId": "00000000-0000-0000-0000-000000000002",
    "word": "Apple",
    "meaning": "Quả táo",
    "distractor": "Quả cam",
    "wordType": 0
  }
]`}
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Bắt buộc theo DTO backend: lessonId, word, meaning, distractor,
            wordType. imageUrl/audioUrl là tùy chọn.
          </p>
          <p className="text-xs text-slate-500">
            Không cần điền imageUrl/audioUrl — hệ thống sẽ tự sinh ảnh và audio
            cho từ nào còn thiếu. Nếu đã có sẵn link ảnh/audio thì điền vào để
            bỏ qua bước tự sinh.
          </p>
        </details>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Chuỗi dữ liệu JSON
          </label>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Dán chuỗi JSON vào đây..."
            className="w-full p-3 border rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-200 bg-slate-50"
          />
        </div>

        {jsonError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {jsonError}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onImport}
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
