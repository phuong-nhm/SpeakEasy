"use client";

import { useMemo } from "react";
import { UserWritingDetailModal } from "@/features/admin/student-writings/components/UserWritingDetailModal";
import { UserWritingFilter } from "@/features/admin/student-writings/components/UserWritingFilter";
import { UserWritingTable } from "@/features/admin/student-writings/components/UserWritingTable";
import { useUserWriting } from "@/features/admin/student-writings/hooks/useUserWriting";

export default function UserWritingsPage() {
  const {
    writings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    userId,
    topicId,
    setUserId,
    setTopicId,
    selectedWriting,
    openDetailModal,
    closeDetailModal,
  } = useUserWriting();

  const filteredWritings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return writings.filter((item) => {
      const matchesQuery =
        query.length === 0 ||
        (item.userName?.toLowerCase() || "").includes(query) ||
        (item.topicTitle?.toLowerCase() || "").includes(query) ||
        item.userContent.toLowerCase().includes(query);

      const matchesUserId =
        !userId || (item.userName || "").toLowerCase() === userId.toLowerCase();

      const matchesTopicId =
        !topicId || item.topicId.toLowerCase() === topicId.toLowerCase();

      return matchesQuery && matchesUserId && matchesTopicId;
    });
  }, [searchQuery, topicId, userId, writings]);

  return (
    <div className="space-y-6 p-6">
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

      <UserWritingFilter
        userId={userId}
        topicId={topicId}
        searchQuery={searchQuery}
        onUserIdChange={setUserId}
        onTopicIdChange={setTopicId}
        onSearchChange={setSearchQuery}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <UserWritingTable
        writings={filteredWritings}
        isLoading={loading}
        onViewDetail={(writing) => {
          void openDetailModal(writing.id);
        }}
      />

      <UserWritingDetailModal
        isOpen={!!selectedWriting}
        writing={selectedWriting}
        onClose={closeDetailModal}
      />
    </div>
  );
}
