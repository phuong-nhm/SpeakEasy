"use client";

import { useSentenceExercise } from "@/features/admin/sentence-exercises/hooks/useSentenceExercise";
import { CascadingFilter } from "@/features/admin/sentence-exercises/components/CascadingFilter";
import { SentenceExerciseTable } from "@/features/admin/sentence-exercises/components/SentenceExerciseTable";
import { SentenceExerciseModal } from "@/features/admin/sentence-exercises/components/SentenceExerciseModal";

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
    isModalOpen,
    editingExercise,
    openAddModal,
    openEditModal,
    closeModal,
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

        <button
          onClick={openAddModal}
          disabled={!selectedLessonId}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Thêm Bài tập mới
        </button>
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
    </div>
  );
}
