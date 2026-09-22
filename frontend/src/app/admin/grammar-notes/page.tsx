"use client";

import { GrammarNoteHeader } from "@/features/admin/grammar-notes/components/GrammarNoteHeader";
import { GrammarNoteTable } from "@/features/admin/grammar-notes/components/GrammarNoteTable";
import { GrammarNoteModal } from "@/features/admin/grammar-notes/components/GrammarNoteModal";
import { GrammarNoteImportModal } from "@/features/admin/grammar-notes/components/GrammarNoteImportModal";
import { CascadingFilter } from "@/features/admin/sentence-exercises/components/CascadingFilter";
import { useAdminGrammarNotes } from "@/features/admin/grammar-notes/hooks/useAdminGrammarNotes";

export default function AdminGrammarNotesPage() {
  const {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    handleLessonChange,
    grammarNotes,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    isAllChapterSelected,
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
    isImportModalOpen,
    importJsonText,
    setImportJsonText,
    importError,
    isImportSubmitting,
    handleStructureFieldChange,
    addStructure,
    removeStructure,
    handlePageChange,
    openCreateModal,
    openImportModal,
    openEditModal,
    closeModal,
    closeImportModal,
    handleSubmit,
    handleImportSubmit,
    handleDelete,
    modalLessons,
  } = useAdminGrammarNotes();

  return (
    <div className="space-y-6">
      <GrammarNoteHeader
        onOpenCreate={openCreateModal}
        onOpenImport={openImportModal}
        isDisabled={!modalLessons.length}
      />

      <CascadingFilter
        levels={levels}
        selectedLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onChapterChange={handleChapterChange}
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        onLessonChange={handleLessonChange}
        disableLessonSelect={isAllChapterSelected}
      />

      <GrammarNoteTable
        notes={grammarNotes}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        showPagination={isAllChapterSelected}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        onOpenEditModal={openEditModal}
        onDelete={handleDelete}
      />

      <GrammarNoteImportModal
        isOpen={isImportModalOpen}
        jsonText={importJsonText}
        onJsonTextChange={setImportJsonText}
        isSubmitting={isImportSubmitting}
        errorMessage={importError}
        onClose={closeImportModal}
        onSubmit={handleImportSubmit}
      />

      <GrammarNoteModal
        isOpen={isModalOpen}
        editingNote={editingNote}
        lessons={modalLessons}
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
