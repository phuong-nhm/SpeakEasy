import { GrammarNoteDto } from "@/features/admin/grammar-notes/types/grammar-note";

interface GrammarNoteTableProps {
  notes: GrammarNoteDto[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
  isLoading: boolean;
  onOpenEditModal: (note: GrammarNoteDto) => void;
  onDelete: (id: string) => void;
}

export function GrammarNoteTable({
  notes,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  showPagination = false,
  onPageChange,
  isLoading,
  onOpenEditModal,
  onDelete,
}: GrammarNoteTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Đang tải Grammar Note...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Chưa có Grammar Note nào cho Lesson này.
        </div>
      ) : (
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
            <tr>
              <th className="px-6 py-3.5">STT</th>
              <th className="px-6 py-3.5">Title</th>
              <th className="px-6 py-3.5">Số Structure</th>
              <th className="px-6 py-3.5">Usage Note</th>
              <th className="px-6 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notes.map((note, index) => (
              <tr key={note.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {note.title}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {note.structures?.length ?? 0}
                </td>
                <td className="px-6 py-4 text-slate-500 max-w-[300px]">
                  {note.usageNote ? (
                    <span className="line-clamp-2">{note.usageNote}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onOpenEditModal(note)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(note.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showPagination && !isLoading && totalCount > 0 && onPageChange && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">
            Hiển thị {notes.length} / {totalCount} grammar note
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt;
            </button>

            <span className="min-w-24 text-center text-sm font-medium text-slate-700">
              Trang {currentPage}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
