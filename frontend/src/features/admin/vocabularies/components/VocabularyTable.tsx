import {
  VocabularyDto,
  WordTypeLabels,
} from "@/features/admin/vocabularies/types/vocabulary"; // Điều chỉnh đường dẫn file type cho đúng project của bạn

interface VocabularyTableProps {
  isLoading: boolean;
  selectedLessonId: string;
  vocabularies: VocabularyDto[];
  onEdit: (vocab: VocabularyDto) => void;
  onDelete: (id: string) => void;
}

export function VocabularyTable({
  isLoading,
  selectedLessonId,
  vocabularies,
  onEdit,
  onDelete,
}: VocabularyTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Đang tải từ vựng...
        </div>
      ) : vocabularies.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          {selectedLessonId
            ? "Chưa có từ vựng nào thuộc Bài học này."
            : "Vui lòng chọn Bài học để xem danh sách."}
        </div>
      ) : (
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
            <tr>
              <th className="px-6 py-3.5">Từ (Word)</th>
              <th className="px-6 py-3.5">Loại từ</th>
              <th className="px-6 py-3.5">Nghĩa (Meaning)</th>
              <th className="px-6 py-3.5">Hình ảnh</th>
              <th className="px-6 py-3.5">Âm thanh</th>
              <th className="px-6 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vocabularies.map((vocab) => (
              <tr key={vocab.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-800">
                  {vocab.word}
                </td>
                <td className="px-6 py-4 text-xs">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                    {WordTypeLabels[vocab.wordType] || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  {vocab.meaning}
                </td>
                <td className="px-6 py-4 text-xs max-w-[150px] truncate">
                  {vocab.imageUrl ? (
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      title={vocab.imageUrl}
                    >
                      {vocab.imageUrl}
                    </span>
                  ) : (
                    <span className="text-slate-400">Chưa có</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs max-w-[150px] truncate">
                  {vocab.audioUrl ? (
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      title={vocab.audioUrl}
                    >
                      {vocab.audioUrl}
                    </span>
                  ) : (
                    <span className="text-slate-400">Chưa có</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onEdit(vocab)}
                    className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(vocab.id)}
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
