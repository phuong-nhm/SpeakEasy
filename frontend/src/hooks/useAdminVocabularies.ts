'use client';

import { useState, useEffect, useCallback } from 'react';
import { LessonDto } from '@/types/admin';
import { VocabularyDto, CreateUpdateVocabularyDto } from '@/types/admin';
import { lessonService } from '@/mock/mockContentService';
import { vocabularyService } from '@/mock/mockVocabulary';

export function useAdminVocabularies() {
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Modal Thêm / Sửa đơn lẻ
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVocabulary, setEditingVocabulary] = useState<VocabularyDto | null>(null);

  // Modal Import Hàng Loạt
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // States chuẩn theo CreateUpdateVocabularyDto
  const [word, setWord] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [distractor, setDistractor] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch danh sách Lessons khi mount và tự chọn lesson đầu tiên
  useEffect(() => {
    let isMounted = true;

    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        const data = await lessonService.getList();

        if (isMounted) {
          setLessons(data);
          if (data.length > 0) {
            setSelectedLessonId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách lesson:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLessons();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Vocabularies mỗi khi selectedLessonId thay đổi
  useEffect(() => {
    let isMounted = true;

    const fetchVocabularies = async () => {
      if (!selectedLessonId) return;

      try {
        setIsLoading(true);
        const data = await vocabularyService.getByLessonId(selectedLessonId);

        if (isMounted) {
          setVocabularies(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách vocabulary:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVocabularies();

    return () => {
      isMounted = false;
    };
  }, [selectedLessonId]);

  // Handle thay đổi Lesson được chọn
  const handleLessonChange = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId);
  }, []);

  // Single Modal Handlers
  const openCreateModal = useCallback(() => {
    setEditingVocabulary(null);
    setWord('');
    setMeaning('');
    setImageUrl('');
    setAudioUrl('');
    setDistractor('');
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((vocab: VocabularyDto) => {
    setEditingVocabulary(vocab);
    setWord(vocab.word || '');
    setMeaning(vocab.meaning || '');
    setImageUrl(vocab.imageUrl || '');
    setAudioUrl(vocab.audioUrl || '');
    setDistractor('');
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingVocabulary(null);
  }, []);

  // Import Modal Handlers
  const openImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  // Single Submit Handler (Create / Update)
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!word.trim() || !meaning.trim() || !selectedLessonId) {
        return;
      }

      setIsSubmitting(true);

      const payload: CreateUpdateVocabularyDto = {
        lessonId: selectedLessonId,
        word,
        meaning,
        imageUrl,
        audioUrl,
        distractor,
      };

      try {
        if (editingVocabulary) {
          await vocabularyService.update(editingVocabulary.id, payload);
        } else {
          await vocabularyService.create(payload);
        }

        setIsModalOpen(false);

        // Refetch lại danh sách
        const updatedVocabs = await vocabularyService.getByLessonId(selectedLessonId);
        setVocabularies(updatedVocabs);
      } catch (err) {
        console.error('Lỗi khi lưu từ vựng:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [word, meaning, imageUrl, audioUrl, distractor, selectedLessonId, editingVocabulary]
  );

  // Bulk Create Handler (Import Hàng Loạt)
  const handleImportMany = useCallback(
    async (rawItems: Omit<CreateUpdateVocabularyDto, 'lessonId'>[], customLessonId?: string) => {
      const targetLessonId = customLessonId || selectedLessonId;

      if (!targetLessonId || rawItems.length === 0) {
        alert('Vui lòng chọn Bài học và kiểm tra danh sách từ vựng!');
        return;
      }

      setIsSubmitting(true);

      try {
        // Tự động map lessonId vào từng item
        const payload: CreateUpdateVocabularyDto[] = rawItems.map((item) => ({
          ...item,
          lessonId: targetLessonId,
        }));

        // Gọi service createMany
        await vocabularyService.createMany(payload);

        setIsImportModalOpen(false);

        // Fetch lại danh sách từ vựng thuộc lesson đang chọn
        const updatedVocabs = await vocabularyService.getByLessonId(selectedLessonId);
        setVocabularies(updatedVocabs);
      } catch (err) {
        console.error('Lỗi khi import danh sách từ vựng:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedLessonId]
  );

  // Delete Handler
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Bạn có chắc muốn xóa từ vựng này?')) return;

      try {
        await vocabularyService.delete(id);

        if (selectedLessonId) {
          const updatedVocabs = await vocabularyService.getByLessonId(selectedLessonId);
          setVocabularies(updatedVocabs);
        }
      } catch (err) {
        console.error('Lỗi khi xóa từ vựng:', err);
      }
    },
    [selectedLessonId]
  );

  return {
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
  };
}