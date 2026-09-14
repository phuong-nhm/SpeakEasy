"use client";

import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";

interface UserWritingDetailModalProps {
  isOpen: boolean;
  writing: UserWritingDto | null;
  onClose: () => void;
}

export function UserWritingDetailModal({
  isOpen,
  writing,
  onClose,
}: UserWritingDetailModalProps) {
  if (!isOpen || !writing) return null;

  const { feedback } = writing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Chi tiết Bài làm Học viên
            </h2>
            <p className="text-xs text-slate-500">
              Ngày nộp: {new Date(writing.creationTime).toLocaleString("vi-VN")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Thông tin Chủ đề & Học viên */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Học viên
            </span>
            <span className="font-medium text-slate-800">
              {writing.userName || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Chủ đề bài viết (Topic)
            </span>
            <span className="font-medium text-slate-800">
              {writing.topicTitle || writing.topicId}
            </span>
          </div>
        </div>

        {/* Nội dung bài viết của User */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Nội dung bài làm (User Content):
          </h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-800 font-mono whitespace-pre-wrap">
            {writing.userContent}
          </div>
        </div>

        {/* Kết quả đánh giá từ Gemini AI */}
        {feedback ? (
          <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-indigo-900">
                  Đánh giá bởi Gemini AI
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    feedback.isCorrect
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {feedback.isCorrect ? "Đạt yêu cầu" : "Cần cải thiện"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-indigo-600">
                  {feedback.score}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  /100 điểm
                </span>
              </div>
            </div>

            {/* Giải thích tổng quan */}
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                Nhận xét tổng quan (Explanation)
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {feedback.explanation}
              </p>
            </div>

            {/* Bài sửa gợi ý */}
            {feedback.suggestedCorrection && (
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
                  Bài làm hoàn chỉnh gợi ý (Suggested Correction)
                </h4>
                <div className="rounded-lg bg-white p-3 text-sm text-emerald-900 border border-emerald-200 font-mono">
                  {feedback.suggestedCorrection}
                </div>
              </div>
            )}

            {/* Danh sách lỗi chi tiết */}
            {feedback.errors && feedback.errors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
                  Danh sách lỗi chi tiết ({feedback.errors.length})
                </h4>
                <div className="space-y-2">
                  {feedback.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-white p-3 border border-rose-100 text-sm gap-2"
                    >
                      <div className="space-y-1">
                        <span className="inline-block rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                          {err.errorType}
                        </span>
                        <p className="text-rose-900 line-through text-xs font-mono">
                          {err.originalText}
                        </p>
                      </div>
                      <div className="text-right sm:text-left">
                        <span className="text-xs text-slate-400 block">
                          Sửa thành:
                        </span>
                        <span className="font-semibold text-emerald-600 font-mono">
                          {err.suggestion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Bài viết này chưa được xử lý đánh giá bởi Gemini AI.
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
