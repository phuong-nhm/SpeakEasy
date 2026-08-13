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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingChapter, setEditingChapter] = useState<ChapterDto | null>(null);
  const [title, setTitle] = useState<string>('');
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);




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
      console.error('Lỗi khi tải danh sách level:', err);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  fetchLevels();

  return () => {
    isMounted = false;
  };
}, []);


  useEffect(() => {
    let isMounted = true;

    const fetchChapters = async () => {
      if (!selectedLevelId) return;

      try {
        setIsLoading(true);
        const data = await chapterService.getByLevelId(selectedLevelId);

        if (isMounted) {
          setChapters(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách chapter:', err);
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


  // TODO 6: Viết handleLevelChange(levelId: string) bọc trong useCallback
  // Set selectedLevelId = levelId
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


  // TODO 10: Viết handleSubmit(e: React.FormEvent) bọc trong useCallback
  // - e.preventDefault()
  // - Validate: nếu !title.trim() hoặc !selectedLevelId thì return
  // - Set isSubmitting = true
  // - Nếu editingChapter: gọi chapterService.update, ngược lại gọi chapterService.create
  // - Đóng modal, fetch lại danh sách chapter mới nhất (getByLevelId) và setChapters
  // - Finally: set isSubmitting = false
  // - Dependency array: [title, selectedLevelId, editingChapter, orderIndex]
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !selectedLevelId) {
        return;
      }

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

        const updatedChapters = await chapterService.getByLevelId(selectedLevelId);

        setChapters(updatedChapters);

      } finally {

        setIsSubmitting(false);

      }
    },
    [title, selectedLevelId, editingChapter, orderIndex]
  );


  // TODO 11: Viết handleDelete(id: string) bọc trong useCallback
  // - Hỏi confirm('Bạn có chắc muốn xóa Chapter này?')
  // - Nếu đồng ý: gọi chapterService.delete(id)
  // - Nếu có selectedLevelId, fetch lại danh sách chapter mới và setChapters
  // - Dependency array: [selectedLevelId]
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