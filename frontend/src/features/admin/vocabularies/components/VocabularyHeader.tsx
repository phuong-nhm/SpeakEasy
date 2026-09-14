interface VocabularyHeaderProps {
  selectedLessonId: string;
  onOpenImportModal: () => void;
  onOpenCreateModal: () => void;
}

export function VocabularyHeader({
  selectedLessonId,
  onOpenImportModal,
  onOpenCreateModal,
}: VocabularyHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Quản Lý Từ Vựng (Vocabulary)
        </h1>
        <p className="text-slate-500 text-sm">
          API Endpoint:{" "}
          <code className="bg-slate-200 px-1 rounded text-xs">
            /api/app/vocabulary
          </code>
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenImportModal}
          disabled={!selectedLessonId}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          📥 Import Hàng Loạt
        </button>
        <button
          onClick={onOpenCreateModal}
          disabled={!selectedLessonId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          + Thêm Từ Vựng
        </button>
      </div>
    </div>
  );
}
