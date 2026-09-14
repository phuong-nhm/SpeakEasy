"use client";

import { useAdminLevels } from "@/features/admin/levels/hooks/useAdminLevels";
import { LevelHeader } from "@/features/admin/levels/components/LevelHeader";
import { LevelTable } from "@/features/admin/levels/components/LevelTable";
import { LevelModal } from "@/features/admin/levels/components/LevelModal";

export default function AdminLevelsPage() {
  const {
    levels,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingLevel,
    name,
    setName,
    description,
    setDescription,
    error,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminLevels();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <LevelHeader onOpenCreate={openCreateModal} />

      <LevelTable
        levels={levels}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <LevelModal
        isOpen={isModalOpen}
        editingLevel={editingLevel}
        name={name}
        description={description}
        error={error}
        isSubmitting={isSubmitting}
        setName={setName}
        setDescription={setDescription}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
