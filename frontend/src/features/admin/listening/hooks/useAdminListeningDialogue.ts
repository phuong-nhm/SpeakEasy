"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LevelDto } from "@/features/admin/levels/types/level";
import { LessonDto } from "@/features/admin/lessons/types/lesson";
import {
  CreateUpdateSentenceExerciseDto,
  ExerciseType,
  SectionType,
  SentenceExerciseDto,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { levelService } from "@/features/admin/levels/services/levelService";
import { lessonService } from "@/features/admin/lessons/services/lessonService";
import { sentenceExerciseService } from "@/features/admin/sentence-exercises/services/sentenceExerciseService";

interface DialogueSubmitInput {
  lessonId: string;
  correctSentence: string;
  distractorSentence: string;
  dialogueGroupId: string;
  orderInGroup: number;
}

const sortDialogues = (items: SentenceExerciseDto[]): SentenceExerciseDto[] =>
  [...items].sort((a, b) => {
    const groupCompare = (a.dialogueGroupId || "").localeCompare(
      b.dialogueGroupId || "",
    );
    if (groupCompare !== 0) return groupCompare;
    return (a.orderInGroup ?? 0) - (b.orderInGroup ?? 0);
  });

export function useAdminListeningDialogue() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [lessons, setLessons] = useState<LessonDto[]>([]);

  const [dialogues, setDialogues] = useState<SentenceExerciseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingDialogue = useMemo(
    () => dialogues.find((item) => item.id === editingId) || null,
    [dialogues, editingId],
  );

  const fetchDialogues = useCallback(async (chapterId: string) => {
    if (!chapterId) {
      setDialogues([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await sentenceExerciseService.getByChapterId(chapterId);
      const filtered = data.filter(
        (item) =>
          item.exerciseType === ExerciseType.ListenChoose &&
          !!item.dialogueGroupId?.trim(),
      );
      setDialogues(sortDialogues(filtered));
    } catch (error) {
      console.error("Lỗi tải dialogue listening:", error);
      setDialogues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshForChapter = useCallback(async () => {
    if (!selectedChapterId) {
      setDialogues([]);
      return;
    }
    await fetchDialogues(selectedChapterId);
  }, [fetchDialogues, selectedChapterId]);

  useEffect(() => {
    let isMounted = true;

    const initLevels = async () => {
      try {
        const data = await levelService.getList();
        if (!isMounted) return;
        setLevels(data);
        if (data.length > 0) {
          setSelectedLevelId(data[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải level cho listening dialogue:", error);
      }
    };

    initLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadChapters = async () => {
      if (!selectedLevelId) {
        setChapters([]);
        setSelectedChapterId("");
        return;
      }

      try {
        const chapterData = await chapterService.getByLevelId(selectedLevelId);
        if (!isMounted) return;

        setChapters(chapterData);
        if (chapterData.length === 0) {
          setSelectedChapterId("");
          return;
        }

        setSelectedChapterId((current) => {
          const exists = chapterData.some((chapter) => chapter.id === current);
          return exists ? current : chapterData[0].id;
        });
      } catch (error) {
        console.error("Lỗi tải chapter cho listening dialogue:", error);
      }
    };

    loadChapters();

    return () => {
      isMounted = false;
    };
  }, [selectedLevelId]);

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      if (!selectedChapterId) {
        setLessons([]);
        setDialogues([]);
        return;
      }

      try {
        const [lessonData] = await Promise.all([
          lessonService.getByChapterId(selectedChapterId),
          fetchDialogues(selectedChapterId),
        ]);

        if (!isMounted) return;
        setLessons(lessonData);
      } catch (error) {
        if (!isMounted) return;
        setLessons([]);
      }
    };

    loadLessons();

    return () => {
      isMounted = false;
    };
  }, [fetchDialogues, selectedChapterId]);

  const handleSelectChapter = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    setEditingId(null);
  }, []);

  const handleOpenModal = useCallback((id?: string) => {
    setEditingId(id ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSubmit = useCallback(
    async (input: DialogueSubmitInput) => {
      setIsSubmitting(true);
      try {
        const payload: CreateUpdateSentenceExerciseDto = {
          lessonId: input.lessonId,
          sectionType: SectionType.Dialogue,
          exerciseType: ExerciseType.ListenChoose,
          correctSentence: input.correctSentence.trim(),
          distractorSentence: input.distractorSentence.trim(),
          dialogueGroupId: input.dialogueGroupId.trim(),
          orderInGroup: input.orderInGroup,
        };

        if (editingDialogue) {
          await sentenceExerciseService.update(editingDialogue.id, payload);
        } else {
          await sentenceExerciseService.create(payload);
        }

        handleCloseModal();
        await refreshForChapter();
      } catch (error) {
        console.error("Lỗi lưu dialogue:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingDialogue, handleCloseModal, refreshForChapter],
  );

  const handleImportMany = useCallback(
    async (inputs: DialogueSubmitInput[]) => {
      if (inputs.length === 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = inputs.map((item) => ({
          lessonId: item.lessonId,
          sectionType: SectionType.Dialogue,
          exerciseType: ExerciseType.ListenChoose,
          correctSentence: item.correctSentence.trim(),
          distractorSentence: item.distractorSentence.trim(),
          dialogueGroupId: item.dialogueGroupId.trim(),
          orderInGroup: item.orderInGroup,
        }));

        await sentenceExerciseService.createMany(payload);
        await refreshForChapter();
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshForChapter],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa dialogue sentence này?")) {
        return;
      }

      try {
        await sentenceExerciseService.delete(id);
        await refreshForChapter();
      } catch (error) {
        console.error("Lỗi xóa dialogue:", error);
      }
    },
    [refreshForChapter],
  );

  return {
    levels,
    selectedLevelId,
    setSelectedLevelId,
    chapters,
    selectedChapterId,
    lessons,
    dialogues,
    editingId,
    editingDialogue,
    isLoading,
    isModalOpen,
    isSubmitting,
    handleSelectChapter,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleImportMany,
    handleDelete,
  };
}
