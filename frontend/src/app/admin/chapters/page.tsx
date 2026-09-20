"use client";

import { useAdminChapters } from "@/features/admin/chapters/hooks/useAdminChapters";
import { ChapterHeader } from "@/features/admin/chapters/components/ChapterHeader";
import { ChapterFilterBar } from "@/features/admin/chapters/components/ChapterFilterBar";
import { ChapterTable } from "@/features/admin/chapters/components/ChapterTable";
import { ChapterModal } from "@/features/admin/chapters/components/ChapterModal";

export default function AdminChaptersPage() {
  const {
    levels,
    selectedLevelId,
    chapters,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    isLoading,
    isModalOpen,
    editingChapter,
    title,
    setTitle,
    orderIndex,
    setOrderIndex,
    isSubmitting,
    handleLevelChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminChapters();

  const canGoPrev = pageIndex > 1;
  const canGoNext = pageIndex < totalPages;

  return (
    <div className="space-y-6">
      <ChapterHeader
        onOpenCreate={openCreateModal}
        isDisabled={!selectedLevelId}
      />

      <ChapterFilterBar
        levels={levels}
        selectedLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
      />

      <ChapterTable
        chapters={chapters}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {!isLoading && selectedLevelId && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm text-slate-600">
            Hiển thị {chapters.length} / {totalCount} chapter
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageIndex(1)}
              disabled={pageIndex === 1}
              className="rounded border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Trang đầu"
            >
              &lt;&lt;
            </button>

            <button
              type="button"
              onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
              disabled={!canGoPrev}
              className="rounded border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Trang trước"
            >
              &lt;
            </button>

            <span className="min-w-24 text-center text-sm font-medium text-slate-700">
              Trang {pageIndex}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPageIndex((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={!canGoNext}
              className="rounded border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Trang sau"
            >
              &gt;
            </button>

            <button
              type="button"
              onClick={() => setPageIndex(totalPages)}
              disabled={pageIndex === totalPages}
              className="rounded border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
              aria-label="Trang cuối"
            >
              &gt;&gt;
            </button>

            <div className="ml-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
              {pageSize}/trang
            </div>
          </div>
        </div>
      )}

      <ChapterModal
        isOpen={isModalOpen}
        editingChapter={editingChapter}
        title={title}
        orderIndex={orderIndex}
        isSubmitting={isSubmitting}
        setTitle={setTitle}
        setOrderIndex={setOrderIndex}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  );
}
