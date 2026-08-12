'use client';

import { useState, useEffect, useCallback } from 'react';
import { LevelDto, ChapterDto } from '@/types/admin';
import { levelService } from '@/mock/mockLevel';
import { chapterService } from '@/mock/mockContentService';

export function useAdminChapters() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterDto | null>(null);
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Khởi tạo danh sách Level (dùng useEffect trực tiếp, không useCallback)
  useEffect(() => {
    let isMounted = true;
    levelService.getList().then((data) => {
      if (isMounted) {
        setLevels(data);
        if (data.length > 0) {
          setSelectedLevelId(data[0].id);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải Chapter khi selectedLevelId thay đổi (useEffect trực tiếp)
useEffect(() => {
  if (!selectedLevelId) return;

  let isMounted = true;

  const fetchChapters = async () => {
    try {
      setIsLoading(true);
      const data = await chapterService.getByLevelId(selectedLevelId);
      
      if (isMounted) {
        setChapters(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách chapter:', err);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  fetchChapters();

  return () => {
    isMounted = false;
  };
}, [selectedLevelId]);

  // 3. Event Handlers dùng useCallback
  const handleLevelChange = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingChapter(null);
    setTitle('');
    setOrderIndex(chapters.length + 1);
    setIsModalOpen(true);
  }, [chapters.length]);

  const openEditModal = useCallback((chap: ChapterDto) => {
    setEditingChapter(chap);
    setTitle(chap.title);
    setOrderIndex(chap.orderIndex);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingChapter(null);
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
        setIsModalOpen(false);
        // Refresh danh sách
        const updatedChapters = await chapterService.getByLevelId(selectedLevelId);
        setChapters(updatedChapters);
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, selectedLevelId, editingChapter, orderIndex]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Bạn có chắc muốn xóa Chapter này?')) return;
      await chapterService.delete(id);
      if (selectedLevelId) {
        const updatedChapters = await chapterService.getByLevelId(selectedLevelId);
        setChapters(updatedChapters);
      }
    },
    [selectedLevelId]
  );

  return {
    levels,
    selectedLevelId,
    chapters,
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