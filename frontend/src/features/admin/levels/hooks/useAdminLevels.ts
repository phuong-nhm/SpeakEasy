"use client";

import { useState, useEffect, useCallback } from "react";
import { LevelDto } from "@/features/admin/levels/types/level";
import { levelService } from "@/features/admin/levels/services/levelService";

export function useAdminLevels() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLevel, setEditingLevel] = useState<LevelDto | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchLevels = async () => {
      try {
        setIsLoading(true);
        const data = await levelService.getList();
        if (isMounted) setLevels(data);
      } catch (err) {
        console.error("Lỗi fetch danh sách Level:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setError("");
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingLevel(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((level: LevelDto) => {
    setEditingLevel(level);
    setName(level.name);
    setDescription(level.description);
    setError("");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLevel(null);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      if (!trimmedName) {
        setError("Tên Level không được để trống!");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        if (editingLevel) {
          const updated = await levelService.update(editingLevel.id, {
            name: trimmedName,
            description: trimmedDescription,
          });
          setLevels((prevLevels) =>
            prevLevels.map((level) =>
              level.id === editingLevel.id ? updated : level,
            ),
          );
        } else {
          const created = await levelService.create({
            name: trimmedName,
            description: trimmedDescription,
          });
          setLevels((prevLevels) => [created, ...prevLevels]);
        }
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Có lỗi xảy ra!");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, editingLevel, closeModal],
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Level này?")) return;

    try {
      await levelService.delete(id);
      setLevels((prevLevels) => prevLevels.filter((level) => level.id !== id));
    } catch (err) {
      alert("Xóa thất bại!");
    }
  }, []);

  return {
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
  };
}
