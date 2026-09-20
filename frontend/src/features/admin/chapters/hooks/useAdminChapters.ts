"use client";

import { useState, useEffect, useCallback } from "react";
import { LevelDto } from "@/features/admin/levels/types/level";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { levelService } from "@/features/admin/levels/services/levelService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";

export function useAdminChapters() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingChapter, setEditingChapter] = useState<ChapterDto | null>(null);
  const [title, setTitle] = useState<string>("");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Trigger để reload lại danh sách Chapters khi CUD
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const refetchChapters = () => setRefreshKey((prev) => prev + 1);

  // 1. Fetch danh sách Levels
  useEffect(() => {
    let isMounted = true;

    const fetchLevels = async () => {
      try {
        setIsLoading(true);
        const data = await levelService.getList();
        if (isMounted) {
          setLevels(data);
          if (data.length > 0) {
            setSelectedLevelId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách level:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLevels();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Chapters theo selectedLevelId & refreshKey
  useEffect(() => {
    if (!selectedLevelId) return;

    let isMounted = true;

    const loadChapters = async () => {
      try {
        setIsLoading(true);
        const skipCount = (pageIndex - 1) * pageSize;
        const data = await chapterService.getByLevelIdPaged(selectedLevelId, {
          skipCount,
          maxResultCount: pageSize,
        });

        if (isMounted) {
          setChapters(data.items);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách chapter:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadChapters();

    return () => {
      isMounted = false;
    };
  }, [selectedLevelId, refreshKey, pageIndex, pageSize]);

  // Handlers
  const handleLevelChange = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
    setPageIndex(1);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingChapter(null);
    setTitle("");
    setOrderIndex((pageIndex - 1) * pageSize + chapters.length + 1);
    setIsModalOpen(true);
  }, [chapters.length, pageIndex, pageSize]);

  const openEditModal = useCallback((chap: ChapterDto) => {
    setEditingChapter(chap);
    setTitle(chap.title);
    setOrderIndex(chap.orderIndex);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingChapter(null);
    setTitle("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !selectedLevelId) return;

      setIsSubmitting(true);
      try {
        if (editingChapter) {
          await chapterService.update(editingChapter.id, {
            title,
            orderIndex,
            levelId: selectedLevelId,
          });
        } else {
          await chapterService.create({
            title,
            orderIndex,
            levelId: selectedLevelId,
          });
        }
        closeModal();
        refetchChapters(); // Kích hoạt useEffect chạy lại không bị warning
      } catch (err) {
        console.error("Lỗi khi lưu chapter:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, selectedLevelId, editingChapter, orderIndex, closeModal],
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa Chapter này?")) return;

    try {
      await chapterService.delete(id);
      refetchChapters(); // Kích hoạt useEffect chạy lại
    } catch (err) {
      console.error("Lỗi khi xóa chapter:", err);
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);

  return {
    levels,
    selectedLevelId,
    chapters,
    totalCount,
    pageIndex,
    pageSize,
    totalPages,
    setPageIndex,
    isLoading,
    isModalOpen,
    editingChapter,
    title,
    setTitle,
    orderIndex,
    setOrderIndex,
    isSubmitting,
    handleLevelChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}
