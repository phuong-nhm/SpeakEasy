import { ChapterDto } from "@/features/admin/chapters/types/chapter";

interface ChapterTableProps {
  chapters: ChapterDto[];
  isLoading: boolean;
  onEdit: (chap: ChapterDto) => void;
  onDelete: (id: string) => void;
}

export function ChapterTable({
  chapters,
  isLoading,
  onEdit,
  onDelete,
}: ChapterTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Đang tải Chapters...
        </div>
      ) : chapters.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Chưa có Chapter nào thuộc Level này.
        </div>
      ) : (
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
            <tr>
              <th className="px-6 py-3.5 w-16 text-center">STT</th>
              <th className="px-6 py-3.5">Thứ tự (OrderIndex)</th>
              <th className="px-6 py-3.5">Tiêu đề (Title)</th>
              <th className="px-6 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chapters.map((chap, index) => (
              <tr key={chap.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-center font-medium text-slate-400">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-bold text-blue-600">
                  #{chap.orderIndex}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  {chap.title}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onEdit(chap)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(chap.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium"
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
