"use client";

import { useUserWriting } from "@/hooks/useUserWriting";
import { UserWritingDetailModal } from "@/components/UserWritingDetailModal";

export default function UserWritingsPage() {
  const {
    writings,
    searchQuery,
    setSearchQuery,
    selectedWriting,
    openDetailModal,
    closeDetailModal,
  } = useUserWriting();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý Bài viết Học viên (User Writings)
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi danh sách bài nộp của học viên, xem kết quả chấm điểm và
            phân tích lỗi từ Gemini AI.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, chủ đề hoặc nội dung bài viết..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {writings.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Không tìm thấy bài viết nào phù hợp.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">STT</th>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Chủ đề (Topic)</th>
                <th className="px-6 py-3">Nội dung xem trước</th>
                <th className="px-6 py-3 text-center">Điểm AI</th>
                <th className="px-6 py-3">Ngày nộp</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {writings.map((item, index) => {
                const feedback = item.feedback;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.userName || "N/A"}
                    </td>

                    <td className="px-6 py-4 max-w-xs font-medium text-slate-700 truncate">
                      {item.topicTitle || item.topicId}
                    </td>

                    <td className="px-6 py-4 max-w-sm text-slate-500 truncate">
                      {item.userContent}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {feedback ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                          <span>{feedback.score}</span>
                          <span className="text-[10px] text-indigo-400">
                            /100
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                          Chưa chấm
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(item.creationTime).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <UserWritingDetailModal
        isOpen={!!selectedWriting}
        writing={selectedWriting}
        onClose={closeDetailModal}
      />
    </div>
  );
}
