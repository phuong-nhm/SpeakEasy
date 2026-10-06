"use client";

import { useState } from "react";
import { useAdminListening } from "@/features/admin/listening/hooks/useAdminListening";
import { useAdminListeningDialogue } from "@/features/admin/listening/hooks/useAdminListeningDialogue";
import { ListeningHeader } from "@/features/admin/listening/components/ListeningHeader";
import { ListeningFilterBar } from "@/features/admin/listening/components/ListeningFilterBar";
import { ListeningPassageTable } from "@/features/admin/listening/components/ListeningPassageTable";
import { ListeningPassageModal } from "@/features/admin/listening/components/ListeningPassageModal";
import { ListeningDialogueTable } from "@/features/admin/listening/components/ListeningDialogueTable";
import { ListeningDialogueModal } from "@/features/admin/listening/components/ListeningDialogueModal";

export default function AdminListeningPage() {
  const [activeTab, setActiveTab] = useState<"passage" | "dialogue">("passage");

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

  const {
    selectedChapterId: selectedDialogueChapterId,
    chapters: dialogueChapters,
    lessons,
    dialogues,
    editingDialogue,
    isLoading: isDialogueLoading,
    isModalOpen: isDialogueModalOpen,
    isSubmitting: isDialogueSubmitting,
    handleSelectChapter,
    handleOpenModal,
    handleCloseModal,
    handleSubmit: handleDialogueSubmit,
    handleDelete: handleDialogueDelete,
  } = useAdminListeningDialogue();

  const isPassageTab = activeTab === "passage";
  const chapterOptions = isPassageTab ? chapters : dialogueChapters;
  const selectedChapter = isPassageTab
    ? selectedChapterId
    : selectedDialogueChapterId;
  const handleChapterSelect = isPassageTab
    ? handleChapterChange
    : handleSelectChapter;

  return (
    <div className="space-y-6">
      <ListeningHeader
        onOpenCreate={
          isPassageTab ? openCreateModal : () => handleOpenModal(undefined)
        }
        isDisabled={isPassageTab ? !selectedLevelId : !selectedChapter}
      />

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab("passage")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            isPassageTab
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Passage
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dialogue")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            !isPassageTab
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Dialogue
        </button>
      </div>

      <ListeningFilterBar
        chapters={chapterOptions}
        selectedChapterId={selectedChapter}
        onChapterChange={handleChapterSelect}
      />

      {isPassageTab ? (
        <>
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
        </>
      ) : (
        <>
          <ListeningDialogueTable
            dialogues={dialogues}
            isLoading={isDialogueLoading}
            onEdit={(dialogue) => handleOpenModal(dialogue.id)}
            onDelete={handleDialogueDelete}
          />

          <ListeningDialogueModal
            isOpen={isDialogueModalOpen}
            isSubmitting={isDialogueSubmitting}
            lessons={lessons}
            editingDialogue={editingDialogue}
            onClose={handleCloseModal}
            onSubmit={handleDialogueSubmit}
          />
        </>
      )}
    </div>
  );
}
