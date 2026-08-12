'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChapterDto, LessonDto, LessonType } from '@/types/admin';
import { chapterService, lessonService } from '@/mock/mockContentService';

export function useAdminLessons() {
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
  const [title, setTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.Vocabulary);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Tải danh sách Chapters khởi tạo
  useEffect(() => {
    let isMounted = true;
    chapterService.getByLevelId('a1b2c3d4-0001-0000-0000-000000000001').then((data) => {
      if (isMounted) {
        setChapters(data);
        if (data.length > 0) setSelectedChapterId(data[0].id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải danh sách Lessons khi selectedChapterId thay đổi
  useEffect(() => {
    if (!selectedChapterId) return;

    let isMounted = true;
    const fetchLessons = async () => {
        try {
        setIsLoading(true);
        const data = await lessonService.getByChapterId(selectedChapterId);
        
        if (isMounted) {
            setLessons(data);
        }
        } catch (err) {
        console.error('Lỗi lấy danh sách lesson:', err);
        } finally {
        if (isMounted) {
            setIsLoading(false);
        }
        }
    }
    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, [selectedChapterId]);

  // 3. Event Handlers với useCallback
  const handleChapterChange = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingLesson(null);
    setTitle('');
    setLessonType(LessonType.Vocabulary);
    setOrderIndex(lessons.length + 1);
    setIsModalOpen(true);
  }, [lessons.length]);

  const openEditModal = useCallback((les: LessonDto) => {
    setEditingLesson(les);
    setTitle(les.title);
    setLessonType(les.lessonType);
    setOrderIndex(les.orderIndex);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLesson(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !selectedChapterId) return;

      setIsSubmitting(true);
      try {
        if (editingLesson) {
          await lessonService.update(editingLesson.id, {
            title,
            lessonType: Number(lessonType),
            orderIndex,
            chapterId: selectedChapterId,
          });
        } else {
          await lessonService.create({
            title,
            lessonType: Number(lessonType),
            orderIndex,
            chapterId: selectedChapterId,
          });
        }
        setIsModalOpen(false);
        const updatedLessons = await lessonService.getByChapterId(selectedChapterId);
        setLessons(updatedLessons);
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, selectedChapterId, editingLesson, lessonType, orderIndex]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Xóa bài học này?')) return;
      await lessonService.delete(id);
      if (selectedChapterId) {
        const updatedLessons = await lessonService.getByChapterId(selectedChapterId);
        setLessons(updatedLessons);
      }
    },
    [selectedChapterId]
  );

  return {
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
    isSubmitting,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}