"use client";

interface WritingTopicHeaderProps {
  onOpenAddModal: () => void;
  isAddDisabled: boolean;
}

export function WritingTopicHeader({
  onOpenAddModal,
  isAddDisabled,
}: WritingTopicHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Quản lý Writing Topics
        </h1>
        <p className="text-sm text-slate-500">
          Thêm, sửa, xóa các đề bài viết theo từng Level và Chapter
        </p>
      </div>
      <button
        onClick={onOpenAddModal}
        disabled={isAddDisabled}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Thêm Writing Topic
      </button>
    </div>
  );
}
