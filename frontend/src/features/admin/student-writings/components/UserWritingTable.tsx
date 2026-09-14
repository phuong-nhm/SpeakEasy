import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";

export interface UserWritingTableProps {
  writings: UserWritingDto[];
  isLoading: boolean;
  onViewDetail: (writing: UserWritingDto) => void;
}

export function UserWritingTable({
  writings,
  isLoading,
  onViewDetail,
}: UserWritingTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Đang tải danh sách bài viết...
      </div>
    );
  }

  if (writings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Không tìm thấy bài viết nào phù hợp.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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

                <td className="max-w-xs truncate px-6 py-4 font-medium text-slate-700">
                  {item.topicTitle || item.topicId}
                </td>

                <td className="max-w-sm truncate px-6 py-4 text-slate-500">
                  {item.userContent}
                </td>

                <td className="px-6 py-4 text-center">
                  {feedback ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      <span>{feedback.score}</span>
                      <span className="text-[10px] text-indigo-400">/100</span>
                    </div>
                  ) : (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                      Chưa chấm
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(item.creationTime).toLocaleDateString("vi-VN")}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(item)}
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
    </div>
  );
}
