interface GrammarNoteHeaderProps {
  onOpenCreate: () => void;
  onOpenImport: () => void;
  isDisabled: boolean;
}

export function GrammarNoteHeader({
  onOpenCreate,
  onOpenImport,
  isDisabled,
}: GrammarNoteHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Quản Lý Ngữ Pháp (Grammar Note)
        </h1>
        <p className="text-slate-500 text-sm">
          API Endpoint:{" "}
          <code className="bg-slate-200 px-1 rounded text-xs">
            /api/app/grammar-note
          </code>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenImport}
          disabled={isDisabled}
          className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Import Hàng Loạt
        </button>
        <button
          onClick={onOpenCreate}
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm Grammar Note
        </button>
      </div>
    </div>
  );
}
