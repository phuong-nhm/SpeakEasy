"use client";

import { useSentenceExercise } from "@/features/admin/sentence-exercises/hooks/useSentenceExercise";
import { CascadingFilter } from "@/features/admin/sentence-exercises/components/CascadingFilter";
import { SentenceExerciseTable } from "@/features/admin/sentence-exercises/components/SentenceExerciseTable";
import { SentenceExerciseModal } from "@/features/admin/sentence-exercises/components/SentenceExerciseModal";
import { SentenceImportModal } from "@/features/admin/sentence-exercises/components/SentenceImportModal";

export default function SentenceExercisePage() {
  const {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    setSelectedLessonId,
    filteredExercises,
    loading,
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
    isModalOpen,
    editingExercise,
    isImportModalOpen,
    isSubmitting,
    openAddModal,
    openEditModal,
    closeModal,
    openImportModal,
    closeImportModal,
    handleImportMany,
    createExercise,
    updateExercise,
    deleteExercise,
  } = useSentenceExercise();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý Bài tập Xếp câu (Sentence Exercise)
          </h1>
          <p className="text-sm text-slate-500">
            Tạo và cập nhật các dạng bài tập ghép câu, điền từ, dịch thuật cho
            từng bài học.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openImportModal}
            disabled={!selectedLessonId}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import Hàng Loạt
          </button>

          <button
            onClick={openAddModal}
            disabled={!selectedLessonId}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Thêm Bài tập mới
          </button>
        </div>
      </div>

      {/* Cascading Filter Header */}
      <CascadingFilter
        levels={levels}
        selectedLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onChapterChange={handleChapterChange}
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        onLessonChange={setSelectedLessonId}
      />

      {/* Exercises Data Table */}
      <SentenceExerciseTable
        exercises={filteredExercises}
        loading={loading}
        onEdit={openEditModal}
        onDelete={deleteExercise}
      />

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">
          Trang {currentPage} / {totalPages} · Tổng {totalCount} bài tập
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

      {/* Form Modal */}
      <SentenceExerciseModal
        isOpen={isModalOpen}
        editingExercise={editingExercise}
        selectedLessonId={selectedLessonId}
        lessons={lessons}
        onClose={closeModal}
        onSubmit={(input) => {
          if (editingExercise) {
            updateExercise(editingExercise.id, input);
          } else {
            createExercise(input);
          }
        }}
      />

      <SentenceImportModal
        isOpen={isImportModalOpen}
        isSubmitting={isSubmitting}
        onClose={closeImportModal}
        onImport={async (rawItems) => {
          await handleImportMany(rawItems);
        }}
      />
    </div>
  );
}
