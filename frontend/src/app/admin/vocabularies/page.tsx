"use client";

import { useState } from "react";
import { useAdminVocabularies } from "@/features/admin/vocabularies/hooks/useAdminVocabularies";
import { VocabularyHeader } from "@/features/admin/vocabularies/components/VocabularyHeader";
import { VocabularyTable } from "@/features/admin/vocabularies/components/VocabularyTable";
import { VocabularyFormModal } from "@/features/admin/vocabularies/components/VocabularyFormModal";
import { VocabularyImportModal } from "@/features/admin/vocabularies/components/VocabularyImportModal";
import { CascadingFilter } from "@/features/admin/sentence-exercises/components/CascadingFilter";

export default function AdminVocabularyPage() {
  const {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    vocabularies,
    isLoading,
    isModalOpen,
    editingVocabulary,
    isImportModalOpen,
    word,
    setWord,
    meaning,
    setMeaning,
    imageUrl,
    setImageUrl,
    audioUrl,
    setAudioUrl,
    distractor,
    setDistractor,
    isSubmitting,
    handleLessonChange,
    openCreateModal,
    openEditModal,
    closeModal,
    openImportModal,
    closeImportModal,
    handleSubmit,
    handleImportMany,
    handleDelete,
  } = useAdminVocabularies();

  // State quản lý text JSON khi paste vào Import Modal
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Xử lý Import JSON
  const handleParseAndImport = async () => {
    setJsonError(null);
    try {
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        setJsonError("Dữ liệu JSON phải là một mảng (Array) các từ vựng!");
        return;
      }

      // Gọi hook xử lý bulk create
      await handleImportMany(parsedData);
      setJsonInput("");
    } catch (err) {
      setJsonError(
        "Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp!",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <VocabularyHeader
        selectedLessonId={selectedLessonId}
        onOpenImportModal={openImportModal}
        onOpenCreateModal={openCreateModal}
      />

      {/* Dropdown Lọc theo Lesson */}
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
      />

      {/* Bảng Danh sách Từ vựng */}
      <VocabularyTable
        isLoading={isLoading}
        selectedLessonId={selectedLessonId}
        vocabularies={vocabularies}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Modal Thêm / Sửa Đơn Lẻ */}
      <VocabularyFormModal
        isOpen={isModalOpen}
        editingVocabulary={editingVocabulary}
        word={word}
        setWord={setWord}
        meaning={meaning}
        setMeaning={setMeaning}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        audioUrl={audioUrl}
        setAudioUrl={setAudioUrl}
        distractor={distractor}
        setDistractor={setDistractor}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Modal Import Hàng Loạt (JSON Bulk Import) */}
      <VocabularyImportModal
        isOpen={isImportModalOpen}
        jsonInput={jsonInput}
        setJsonInput={setJsonInput}
        jsonError={jsonError}
        isSubmitting={isSubmitting}
        onClose={closeImportModal}
        onImport={handleParseAndImport}
      />
    </div>
  );
}
