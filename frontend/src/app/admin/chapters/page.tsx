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
