"use client";

import { useAdminLessons } from "@/features/admin/lessons/hooks/useAdminLessons";
import { LessonHeader } from "@/features/admin/lessons/components/LessonHeader";
import { LessonTable } from "@/features/admin/lessons/components/LessonTable";
import { LessonModal } from "@/features/admin/lessons/components/LessonModal";

export default function AdminLessonsPage() {
  const {
    levels,
    selectedLevelId,
    chapters,
    selectedChapterId,
    lessons,
    isLoading,
    isModalOpen,
    editingLesson,
    title,
    setTitle,
    lessonType,
    setLessonType,
    orderIndex,
    setOrderIndex,
    grammarTopic,
    setGrammarTopic,
    isSubmitting,
    handleLevelChange,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminLessons();

  return (
    <div className="space-y-6">
      <LessonHeader
        levels={levels}
        selectedLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onChapterChange={handleChapterChange}
        onOpenCreateModal={openCreateModal}
      />

      <LessonTable
        lessons={lessons}
        isLoading={isLoading}
        onOpenEditModal={openEditModal}
        onDelete={handleDelete}
      />

      <LessonModal
        isOpen={isModalOpen}
        editingLesson={editingLesson}
        title={title}
        setTitle={setTitle}
        lessonType={lessonType}
        setLessonType={setLessonType}
        orderIndex={orderIndex}
        setOrderIndex={setOrderIndex}
        grammarTopic={grammarTopic}
        setGrammarTopic={setGrammarTopic}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
