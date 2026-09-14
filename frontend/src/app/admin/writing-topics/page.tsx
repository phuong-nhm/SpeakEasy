"use client";

import { useWritingTopic } from "@/features/admin/writing-topics/hooks/useWritingTopic";
import { WritingTopicHeader } from "@/features/admin/writing-topics/components/WritingTopicHeader";
import { WritingTopicFilter } from "@/features/admin/writing-topics/components/WritingTopicFilter";
import { WritingTopicTable } from "@/features/admin/writing-topics/components/WritingTopicTable";
import { WritingTopicModal } from "@/features/admin/writing-topics/components/WritingTopicModal";
import { CreateUpdateWritingTopicDto } from "@/features/admin/writing-topics/types/writing-topic";

export default function WritingTopicAdminPage() {
  const {
    levels,
    selectedLevelId,
    setSelectedLevelId,
    chapters,
    selectedChapterId,
    setSelectedChapterId,
    filteredTopics,
    loading,
    isModalOpen,
    editingTopic,
    openAddModal,
    openEditModal,
    closeModal,
    createTopic,
    updateTopic,
    deleteTopic,
  } = useWritingTopic();

  const handleModalSubmit = (input: CreateUpdateWritingTopicDto) => {
    if (editingTopic) {
      updateTopic(editingTopic.id, input);
    } else {
      createTopic(input);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <WritingTopicHeader
        onOpenAddModal={openAddModal}
        isAddDisabled={!selectedChapterId}
      />

      <WritingTopicFilter
        levels={levels}
        selectedLevelId={selectedLevelId}
        onSelectLevel={setSelectedLevelId}
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        onSelectChapter={setSelectedChapterId}
      />

      <WritingTopicTable
        topics={filteredTopics}
        loading={loading}
        onEdit={openEditModal}
        onDelete={deleteTopic}
      />

      <WritingTopicModal
        isOpen={isModalOpen}
        editingTopic={editingTopic}
        selectedChapterId={selectedChapterId}
        chapters={chapters}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
