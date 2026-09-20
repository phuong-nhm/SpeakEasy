import { GrammarNoteDto } from "@/features/admin/grammar-notes/types/grammar-note";

interface GrammarNoteTableProps {
  notes: GrammarNoteDto[];
  isLoading: boolean;
  onOpenEditModal: (note: GrammarNoteDto) => void;
  onDelete: (id: string) => void;
}

export function GrammarNoteTable({
  notes,
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
                  {index + 1}
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
    </div>
  );
}
