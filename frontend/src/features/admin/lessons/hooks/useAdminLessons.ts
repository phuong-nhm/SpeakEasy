"use client";

import { useState, useEffect, useCallback } from "react";
import { LessonDto, LessonType } from "@/features/admin/lessons/types/lesson";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LevelDto } from "@/features/admin/levels/types/level";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { levelService } from "@/features/admin/levels/services/levelService";

export function useAdminLessons() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");

  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [refreshKey, setRefreshKey] = useState<number>(0);
  const refetchLessons = useCallback(
    () => setRefreshKey((prev) => prev + 1),
    [],
  );

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
  const [title, setTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.Combined);
  const [orderIndex, setOrderIndex] = useState(1);
  const [grammarTopic, setGrammarTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Tải danh sách Levels ban đầu
  useEffect(() => {
    let isMounted = true;
    const fetchLevels = async () => {
      try {
        const data = await levelService.getList();
        if (isMounted && data.length > 0) {
          setLevels(data);
          setSelectedLevelId(data[0].id);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách level:", err);
      }
    };
    fetchLevels();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải danh sách Chapters theo selectedLevelId
  useEffect(() => {
    if (!selectedLevelId) return;

    let isMounted = true;
    const fetchChapters = async () => {
      try {
        const data = await chapterService.getByLevelId(selectedLevelId);
        if (isMounted) {
          setChapters(data);
          if (data.length > 0) {
            setSelectedChapterId(data[0].id);
          } else {
            setSelectedChapterId("");
            setLessons([]);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách chapter:", err);
      }
    };
    fetchChapters();
    return () => {
      isMounted = false;
    };
  }, [selectedLevelId]);

  // 3. Tải danh sách Lessons theo selectedChapterId & refreshKey
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
        console.error("Lỗi lấy danh sách lesson:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLessons();
    return () => {
      isMounted = false;
    };
  }, [selectedChapterId, refreshKey]);

  // Handlers
  const handleLevelChange = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
  }, []);

  const handleChapterChange = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    if (!chapterId) {
      setLessons([]);
    }
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingLesson(null);
    setTitle("");
    setLessonType(LessonType.Combined);
    setOrderIndex(lessons.length + 1);
    setGrammarTopic("");
    setIsModalOpen(true);
  }, [lessons.length]);

  const openEditModal = useCallback((les: LessonDto) => {
    setEditingLesson(les);
    setTitle(les.title);
    setLessonType(les.lessonType);
    setOrderIndex(les.orderIndex);
    setGrammarTopic(les.grammarTopic ?? "");
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLesson(null);
    setTitle("");
    setGrammarTopic("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !selectedChapterId) return;

      setIsSubmitting(true);
      try {
        const payload = {
          title,
          lessonType: Number(lessonType),
          orderIndex,
          chapterId: selectedChapterId,
          grammarTopic: grammarTopic.trim() || undefined,
        };

        if (editingLesson) {
          await lessonService.update(editingLesson.id, payload);
        } else {
          await lessonService.create(payload);
        }

        closeModal();
        refetchLessons();
      } catch (err) {
        console.error("Lỗi khi lưu lesson:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      selectedChapterId,
      editingLesson,
      lessonType,
      orderIndex,
      grammarTopic,
      closeModal,
      refetchLessons,
    ],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;

      try {
        await lessonService.delete(id);
        refetchLessons();
      } catch (err) {
        console.error("Lỗi khi xóa lesson:", err);
      }
    },
    [refetchLessons],
  );

  return {
    levels,
    selectedLevelId,
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
    grammarTopic,
    setGrammarTopic,
    isSubmitting,
    handleLevelChange,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}
