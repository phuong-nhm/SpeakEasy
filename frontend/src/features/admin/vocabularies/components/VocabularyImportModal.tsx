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
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            Import Từ Vựng Hàng Loạt (JSON)
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Dán danh sách từ vựng dạng JSON array. Ví dụ:
          </p>
          <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono">
            {`[
  {
    "word": "Hello",
    "meaning": "Xin chào",
    "wordType": 6
  }
]`}
          </pre>
          <p className="text-xs text-slate-500">
            Không cần điền imageUrl/audioUrl — hệ thống sẽ tự sinh ảnh và audio
            cho từ nào còn thiếu. Nếu đã có sẵn link ảnh/audio thì điền vào để
            bỏ qua bước tự sinh.
          </p>
        </div>

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
            className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={isSubmitting || !jsonInput.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Đang Import..." : "Xác nhận Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
