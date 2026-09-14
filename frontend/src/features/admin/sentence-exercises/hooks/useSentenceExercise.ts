import { useState, useEffect, useCallback } from "react";
import {
  SentenceExerciseDto,
  CreateUpdateSentenceExerciseDto,
  FilterOption,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

import { LevelDto } from "@/features/admin/levels/types/level";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LessonDto } from "@/features/admin/lessons/types/lesson";

import { levelService } from "@/features/admin/levels/services/levelService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { sentenceExerciseService } from "../services/sentenceExerciseService";

export function useSentenceExercise() {
  // Cascading Filter States
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [chapters, setChapters] = useState<FilterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [lessons, setLessons] = useState<FilterOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Data & UI States
  const [exercises, setExercises] = useState<SentenceExerciseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] =
    useState<SentenceExerciseDto | null>(null);

  // 1. Load danh sách bài tập theo LessonId
  const loadExercises = useCallback(async (lessonId: string) => {
    if (!lessonId) {
      setExercises([]);
      return;
    }
    setLoading(true);
    try {
      const data: SentenceExerciseDto[] =
        await sentenceExerciseService.getByLessonId(lessonId);
      setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Load Lessons theo ChapterId
  const loadLessons = useCallback(
    async (chapterId: string) => {
      if (!chapterId) {
        setLessons([]);
        setSelectedLessonId("");
        setExercises([]);
        return;
      }
      try {
        const data: LessonDto[] = await lessonService.getByChapterId(chapterId);
        const options: FilterOption[] = data.map((item) => ({
          id: item.id,
          title: item.title,
        }));
        setLessons(options);

        const firstLessonId = options[0]?.id || "";
        setSelectedLessonId(firstLessonId);
        await loadExercises(firstLessonId);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      }
    },
    [loadExercises],
  );

  // 3. Load Chapters theo LevelId
  const loadChapters = useCallback(
    async (levelId: string) => {
      if (!levelId) {
        setChapters([]);
        setSelectedChapterId("");
        setLessons([]);
        setSelectedLessonId("");
        setExercises([]);
        return;
      }
      try {
        const data: ChapterDto[] = await chapterService.getByLevelId(levelId);
        const options: FilterOption[] = data.map((item) => ({
          id: item.id,
          title: item.title, // ChapterDto chỉ lấy title
        }));
        setChapters(options);

        const firstChapterId = options[0]?.id || "";
        setSelectedChapterId(firstChapterId);
        await loadLessons(firstChapterId);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      }
    },
    [loadLessons],
  );

  // 4. Khởi tạo dữ liệu ban đầu
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const data: LevelDto[] = await levelService.getList();
        const options: FilterOption[] = data.map((item) => ({
          id: item.id,
          title: item.name, // LevelDto dùng name
        }));

        if (!isMounted) return;

        setLevels(options);
        if (options.length > 0) {
          const firstLevelId = options[0].id;
          setSelectedLevelId(firstLevelId);
          await loadChapters(firstLevelId);
        }
      } catch (error) {
        console.error("Failed to fetch levels:", error);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [loadChapters]);

  // Handlers thay đổi Filter từ UI
  const handleLevelChange = async (levelId: string) => {
    setSelectedLevelId(levelId);
    await loadChapters(levelId);
  };

  const handleChapterChange = async (chapterId: string) => {
    setSelectedChapterId(chapterId);
    await loadLessons(chapterId);
  };

  const handleLessonChange = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    await loadExercises(lessonId);
  };

  // Modal Actions
  const openAddModal = () => {
    setEditingExercise(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: SentenceExerciseDto) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExercise(null);
  };

  // CRUD Actions
  const createExercise = async (input: CreateUpdateSentenceExerciseDto) => {
    setLoading(true);
    try {
      await sentenceExerciseService.create(input);
      await loadExercises(selectedLessonId);
      closeModal();
    } catch (error) {
      console.error("Failed to create exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = async (
    id: string,
    input: CreateUpdateSentenceExerciseDto,
  ) => {
    setLoading(true);
    try {
      await sentenceExerciseService.update(id, input);
      await loadExercises(selectedLessonId);
      closeModal();
    } catch (error) {
      console.error("Failed to update exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      setLoading(true);
      try {
        await sentenceExerciseService.delete(id);
        await loadExercises(selectedLessonId);
      } catch (error) {
        console.error("Failed to delete exercise:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    levels,
    selectedLevelId,
    handleLevelChange,
    chapters,
    selectedChapterId,
    handleChapterChange,
    lessons,
    selectedLessonId,
    setSelectedLessonId: handleLessonChange,
    filteredExercises: exercises,
    loading,
    isModalOpen,
    editingExercise,
    openAddModal,
    openEditModal,
    closeModal,
    createExercise,
    updateExercise,
    deleteExercise,
  };
}
