"use client";

import { GrammarNoteHeader } from "@/features/admin/grammar-notes/components/GrammarNoteHeader";
import { GrammarNoteFilterBar } from "@/features/admin/grammar-notes/components/GrammarNoteFilterBar";
import { GrammarNoteTable } from "@/features/admin/grammar-notes/components/GrammarNoteTable";
import { GrammarNoteModal } from "@/features/admin/grammar-notes/components/GrammarNoteModal";
import { useAdminGrammarNotes } from "@/features/admin/grammar-notes/hooks/useAdminGrammarNotes";

export default function AdminGrammarNotesPage() {
  const {
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    grammarNotes,
    isLoading,
    isModalOpen,
    editingNote,
    modalLessonId,
    setModalLessonId,
    title,
    setTitle,
    usageNote,
    setUsageNote,
    structures,
    isSubmitting,
    handleStructureFieldChange,
    addStructure,
    removeStructure,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminGrammarNotes();

  return (
    <div className="space-y-6">
      <GrammarNoteHeader
        onOpenCreate={openCreateModal}
        isDisabled={!lessons.length}
      />

      <GrammarNoteFilterBar
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        onLessonChange={setSelectedLessonId}
      />

      <GrammarNoteTable
        notes={grammarNotes}
        isLoading={isLoading}
        onOpenEditModal={openEditModal}
        onDelete={handleDelete}
      />

      <GrammarNoteModal
        isOpen={isModalOpen}
        editingNote={editingNote}
        lessons={lessons}
        lessonId={modalLessonId}
        setLessonId={setModalLessonId}
        title={title}
        setTitle={setTitle}
        usageNote={usageNote}
        setUsageNote={setUsageNote}
        structures={structures}
        onStructureFieldChange={handleStructureFieldChange}
        onAddStructure={addStructure}
        onRemoveStructure={removeStructure}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
