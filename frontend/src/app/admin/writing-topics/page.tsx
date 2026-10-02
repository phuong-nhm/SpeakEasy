"use client";

import { useWritingTopic } from "@/features/admin/writing-topics/hooks/useWritingTopic";
import { WritingTopicHeader } from "@/features/admin/writing-topics/components/WritingTopicHeader";
import { WritingTopicFilter } from "@/features/admin/writing-topics/components/WritingTopicFilter";
import { WritingTopicTable } from "@/features/admin/writing-topics/components/WritingTopicTable";
import { WritingTopicModal } from "@/features/admin/writing-topics/components/WritingTopicModal";
import { CreateUpdateWritingTopicDto } from "@/features/admin/writing-topics/types/writing-topic";

export default function WritingTopicAdminPage() {
  const {
    levels,
    selectedLevelId,
    setSelectedLevelId,
    chapters,
    selectedChapterId,
    topics,
    loading,
    isModalOpen,
    editingTopic,
    currentPage,
    totalPages,
    handlePageChange,
    openAddModal,
    openEditModal,
    closeModal,
    createTopic,
    updateTopic,
    deleteTopic,
  } = useWritingTopic();

  const handleModalSubmit = (input: CreateUpdateWritingTopicDto) => {
    if (editingTopic) {
      updateTopic(editingTopic.id, input);
    } else {
      createTopic(input);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <WritingTopicHeader
        onOpenAddModal={openAddModal}
        isAddDisabled={!selectedChapterId}
      />

      <WritingTopicFilter
        levels={levels}
        selectedLevelId={selectedLevelId}
        onSelectLevel={setSelectedLevelId}
      />

      <WritingTopicTable
        topics={topics}
        loading={loading}
        onEdit={openEditModal}
        onDelete={deleteTopic}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">
          Trang {currentPage} / {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &lt;&lt;
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="rounded border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            &gt;&gt;
          </button>
        </div>
      </div>

      <WritingTopicModal
        isOpen={isModalOpen}
        editingTopic={editingTopic}
        selectedChapterId={selectedChapterId}
        chapters={chapters}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
