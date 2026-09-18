"use client";

import { useAdminListening } from "@/features/admin/listening/hooks/useAdminListening";
import { ListeningHeader } from "@/features/admin/listening/components/ListeningHeader";
import { ListeningFilterBar } from "@/features/admin/listening/components/ListeningFilterBar";
import { ListeningPassageTable } from "@/features/admin/listening/components/ListeningPassageTable";
import { ListeningPassageModal } from "@/features/admin/listening/components/ListeningPassageModal";

export default function AdminListeningPage() {
  const {
    selectedLevelId,
    chapters,
    selectedChapterId,
    visiblePassages,
    isLoading,
    isModalOpen,
    editingPassage,
    isSubmitting,
    isGeneratingAudio,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleGenerateAudio,
    handleSubmit,
    handleDelete,
  } = useAdminListening();

  return (
    <div className="space-y-6">
      <ListeningHeader
        onOpenCreate={openCreateModal}
        isDisabled={!selectedLevelId}
      />

      <ListeningFilterBar
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onChapterChange={handleChapterChange}
      />

      <ListeningPassageTable
        passages={visiblePassages}
        chapters={chapters}
        isLoading={isLoading}
        onOpenEditModal={openEditModal}
        onDelete={handleDelete}
      />

      <ListeningPassageModal
        isOpen={isModalOpen}
        editingPassage={editingPassage}
        chapters={chapters}
        defaultChapterId={chapters[0]?.id ?? ""}
        isSubmitting={isSubmitting}
        isGeneratingAudio={isGeneratingAudio}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onGenerateAudio={handleGenerateAudio}
      />
    </div>
  );
}
