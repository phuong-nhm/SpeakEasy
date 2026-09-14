"use client";

import { LevelDto } from "@/features/admin/levels/types/level";

interface LevelTableProps {
  levels: LevelDto[];
  isLoading: boolean;
  onEdit: (level: LevelDto) => void;
  onDelete: (id: string) => void;
}

export function LevelTable({
  levels,
  isLoading,
  onEdit,
  onDelete,
}: LevelTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-3" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
        <p className="text-base font-medium text-slate-600">
          Chưa có Level nào
        </p>
        <p className="text-sm mt-1">
          Bấm nút Thêm Level Mới để bắt đầu tạo cấp độ đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 w-16 text-center">STT</th>
              <th className="py-4 px-6">Tên Level</th>
              <th className="py-4 px-6">Mô tả</th>
              <th className="py-4 px-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {levels.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="py-4 px-6 text-center font-medium text-slate-400">
                  {index + 1}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-800">
                  {item.name}
                </td>
                <td className="py-4 px-6 text-slate-500 max-w-md truncate">
                  {item.description || "—"}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
