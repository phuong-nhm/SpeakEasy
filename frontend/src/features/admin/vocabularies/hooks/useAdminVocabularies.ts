"use client";

import { useState, useEffect, useCallback } from "react";
import {
  VocabularyDto,
  CreateUpdateVocabularyDto,
  WordType,
} from "@/features/admin/vocabularies/types/vocabulary";
import { levelService } from "@/features/admin/levels/services/levelService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { vocabularyService } from "@/features/admin/vocabularies/services/vocabularyService";
import { FilterOption } from "@/features/admin/sentence-exercises/types/sentence-exercise";

export function useAdminVocabularies() {
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [chapters, setChapters] = useState<FilterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [lessons, setLessons] = useState<FilterOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVocabulary, setEditingVocabulary] =
    useState<VocabularyDto | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const [word, setWord] = useState<string>("");
  const [meaning, setMeaning] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [distractor, setDistractor] = useState<string>("");
  const [wordType, setWordType] = useState<WordType>(WordType.Noun);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadVocabularies = useCallback(async (lessonId: string) => {
    if (!lessonId) {
      setVocabularies([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await vocabularyService.getByLessonId(lessonId);
      setVocabularies(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách vocabulary:", err);
      setVocabularies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLessons = useCallback(
    async (chapterId: string) => {
      if (!chapterId) {
        setLessons([]);
        setSelectedLessonId("");
        setVocabularies([]);
        return;
      }

      try {
        const data = await lessonService.getByChapterId(chapterId);
        const options = data.map((item) => ({
          id: item.id,
          title: item.title,
        }));

        setLessons(options);

        const firstLessonId = options[0]?.id || "";
        setSelectedLessonId(firstLessonId);
        await loadVocabularies(firstLessonId);
      } catch (err) {
        console.error("Lỗi khi tải danh sách lesson:", err);
      }
    },
    [loadVocabularies],
  );

  const loadChapters = useCallback(
    async (levelId: string) => {
      if (!levelId) {
        setChapters([]);
        setSelectedChapterId("");
        setLessons([]);
        setSelectedLessonId("");
        setVocabularies([]);
        return;
      }

      try {
        const data = await chapterService.getByLevelId(levelId);
        const options = data.map((item) => ({
          id: item.id,
          title: item.title,
        }));

        setChapters(options);

        const firstChapterId = options[0]?.id || "";
        setSelectedChapterId(firstChapterId);
        await loadLessons(firstChapterId);
      } catch (err) {
        console.error("Lỗi khi tải danh sách chapter:", err);
      }
    },
    [loadLessons],
  );

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const data = await levelService.getList();
        const options = data.map((item) => ({ id: item.id, title: item.name }));

        if (!isMounted) {
          return;
        }

        setLevels(options);

        if (options.length > 0) {
          const firstLevelId = options[0].id;
          setSelectedLevelId(firstLevelId);
          await loadChapters(firstLevelId);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách level:", err);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [loadChapters]);

  const handleLevelChange = useCallback(
    async (levelId: string) => {
      setSelectedLevelId(levelId);
      await loadChapters(levelId);
    },
    [loadChapters],
  );

  const handleChapterChange = useCallback(
    async (chapterId: string) => {
      setSelectedChapterId(chapterId);
      await loadLessons(chapterId);
    },
    [loadLessons],
  );

  const handleLessonChange = useCallback(
    async (lessonId: string) => {
      setSelectedLessonId(lessonId);
      await loadVocabularies(lessonId);
    },
    [loadVocabularies],
  );

  const openCreateModal = useCallback(() => {
    setEditingVocabulary(null);
    setWord("");
    setMeaning("");
    setImageUrl("");
    setAudioUrl("");
    setDistractor("");
    setWordType(WordType.Noun);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((vocab: VocabularyDto) => {
    setEditingVocabulary(vocab);
    setWord(vocab.word || "");
    setMeaning(vocab.meaning || "");
    setImageUrl(vocab.imageUrl || "");
    setAudioUrl(vocab.audioUrl || "");
    setDistractor("");
    setWordType(vocab.wordType ?? WordType.Noun);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingVocabulary(null);
  }, []);

  const openImportModal = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

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
        wordType,
      };

      try {
        if (editingVocabulary) {
          await vocabularyService.update(editingVocabulary.id, payload);
        } else {
          await vocabularyService.create(payload);
        }

        setIsModalOpen(false);
        await loadVocabularies(selectedLessonId);
      } catch (err) {
        console.error("Lỗi khi lưu từ vựng:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      audioUrl,
      distractor,
      editingVocabulary,
      imageUrl,
      loadVocabularies,
      meaning,
      selectedLessonId,
      word,
      wordType,
    ],
  );

  const handleImportMany = useCallback(
    async (
      rawItems: Omit<CreateUpdateVocabularyDto, "lessonId">[],
      customLessonId?: string,
    ) => {
      const targetLessonId = customLessonId || selectedLessonId;

      if (!targetLessonId || rawItems.length === 0) {
        alert("Vui lòng chọn Bài học và kiểm tra danh sách từ vựng!");
        return;
      }

      setIsSubmitting(true);

      try {
        const invalidIndex = rawItems.findIndex(
          (item) =>
            !item ||
            !item.word?.trim() ||
            !item.meaning?.trim() ||
            !item.distractor?.trim() ||
            item.wordType == null,
        );

        if (invalidIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidIndex + 1} không hợp lệ: cần word, meaning, distractor, wordType.`,
          );
        }

        const payload: CreateUpdateVocabularyDto[] = rawItems.map((item) => ({
          ...item,
          wordType: item.wordType ?? WordType.Noun,
          lessonId: targetLessonId,
        }));

        await vocabularyService.createMany(payload);

        setIsImportModalOpen(false);
        await loadVocabularies(targetLessonId);
      } catch (err) {
        console.error("Lỗi khi import danh sách từ vựng:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadVocabularies, selectedLessonId],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa từ vựng này?")) return;

      try {
        await vocabularyService.delete(id);

        if (selectedLessonId) {
          await loadVocabularies(selectedLessonId);
        }
      } catch (err) {
        console.error("Lỗi khi xóa từ vựng:", err);
      }
    },
    [loadVocabularies, selectedLessonId],
  );

  return {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    handleLessonChange,
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
    wordType,
    setWordType,
    isSubmitting,
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
