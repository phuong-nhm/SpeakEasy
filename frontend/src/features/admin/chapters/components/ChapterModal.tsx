import { ChapterDto } from "@/features/admin/chapters/types/chapter";

interface ChapterModalProps {
  isOpen: boolean;
  editingChapter: ChapterDto | null;
  title: string;
  orderIndex: number;
  isSubmitting: boolean;
  setTitle: (val: string) => void;
  setOrderIndex: (val: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ChapterModal({
  isOpen,
  editingChapter,
  title,
  orderIndex,
  isSubmitting,
  setTitle,
  setOrderIndex,
  onSubmit,
  onClose,
}: ChapterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800">
          {editingChapter ? "Sửa Chapter" : "Thêm Chapter Mới"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tiêu đề Chapter
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Chapter 1: Greetings"
              className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thứ tự hiển thị (OrderIndex)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700 font-medium"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
