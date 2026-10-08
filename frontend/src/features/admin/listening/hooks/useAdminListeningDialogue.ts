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
  partACorrectSentence: string;
  partADistractorSentence: string;
  partBCorrectSentence: string;
  partBVietnameseTranslation: string;
}

const buildUuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
};

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
      const filtered = data.filter((item) => !!item.dialogueGroupId?.trim());
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
      } catch {
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

  const handleLevelChange = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
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
        const dialogueGroupId = buildUuid();
        const payload: CreateUpdateSentenceExerciseDto[] = [
          {
            lessonId: input.lessonId,
            sectionType: SectionType.Dialogue,
            exerciseType: ExerciseType.ListenChoose,
            correctSentence: input.partACorrectSentence.trim(),
            distractorSentence: input.partADistractorSentence.trim(),
            promptText: "",
            dialogueGroupId,
            orderInGroup: 1,
          },
          {
            lessonId: input.lessonId,
            sectionType: SectionType.Dialogue,
            exerciseType: ExerciseType.TranslateFromVietnamese,
            correctSentence: input.partBCorrectSentence.trim(),
            vietnameseTranslation: input.partBVietnameseTranslation.trim(),
            distractorSentence: "",
            promptText: "",
            dialogueGroupId,
            orderInGroup: 2,
          },
        ];

        if (editingDialogue) {
          const payloadForEdit: CreateUpdateSentenceExerciseDto = {
            lessonId: input.lessonId,
            sectionType: SectionType.Dialogue,
            exerciseType: ExerciseType.ListenChoose,
            correctSentence: input.partACorrectSentence.trim(),
            distractorSentence: input.partADistractorSentence.trim(),
            dialogueGroupId: editingDialogue.dialogueGroupId || dialogueGroupId,
            orderInGroup: editingDialogue.orderInGroup ?? 1,
          };

          await sentenceExerciseService.update(
            editingDialogue.id,
            payloadForEdit,
          );
        } else {
          await sentenceExerciseService.createMany(payload);
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
    async (
      rawItems: (Omit<CreateUpdateSentenceExerciseDto, "lessonId"> & {
        lessonId?: string;
      })[],
    ): Promise<number> => {
      if (rawItems.length === 0) {
        throw new Error("Danh sách import rỗng.");
      }

      setIsSubmitting(true);
      try {
        const invalidBaseIndex = rawItems.findIndex(
          (item) =>
            item == null ||
            item.sectionType == null ||
            item.exerciseType == null ||
            !item.correctSentence?.trim(),
        );

        if (invalidBaseIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidBaseIndex + 1} không hợp lệ: bắt buộc sectionType, exerciseType, correctSentence.`,
          );
        }
        const dialogueGroupMap = new Map<number, string>();
        const payload: CreateUpdateSentenceExerciseDto[] = rawItems.map(
          (item, index) => {
            let groupId: string;

            if (item.dialogueGroupId?.trim().toLowerCase() === "auto") {
              // Part A (orderInGroup=1) → tạo UUID mới
              if (item.orderInGroup === 1) {
                groupId = buildUuid();
                dialogueGroupMap.set(index, groupId);
              }
              // Part B (orderInGroup=2) → dùng UUID của Part A trước nó
              else if (item.orderInGroup === 2) {
                groupId = dialogueGroupMap.get(index - 1) || buildUuid();
              } else {
                groupId = buildUuid();
              }
            } else {
              groupId = item.dialogueGroupId?.trim() || "";
            }

            return {
              lessonId: (item.lessonId || "").trim(),
              sectionType: item.sectionType,
              exerciseType: item.exerciseType,
              correctSentence: item.correctSentence.trim(),
              audioUrl:
                item.audioUrl && item.audioUrl.trim()
                  ? item.audioUrl.trim()
                  : undefined,
              promptText: item.promptText?.trim() || "",
              vietnameseTranslation:
                item.vietnameseTranslation?.trim() || undefined,
              distractorSentence: item.distractorSentence?.trim() || "",
              dialogueGroupId: groupId || undefined, // ← Thêm cái này
              orderInGroup: item.orderInGroup,
            };
          },
        );

        const invalidLessonIndex = payload.findIndex(
          (item) => !item.lessonId?.trim(),
        );
        if (invalidLessonIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidLessonIndex + 1} thiếu lessonId.`,
          );
        }

        const invalidDialogueIndex = payload.findIndex(
          (item) => item.sectionType !== SectionType.Dialogue,
        );
        if (invalidDialogueIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidDialogueIndex + 1} phải có sectionType = Dialogue (3).`,
          );
        }

        const invalidExerciseTypeIndex = payload.findIndex(
          (item) =>
            item.exerciseType !== ExerciseType.ListenChoose &&
            item.exerciseType !== ExerciseType.TranslateFromVietnamese,
        );
        if (invalidExerciseTypeIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidExerciseTypeIndex + 1} chỉ hỗ trợ exerciseType = ListenChoose (4) hoặc TranslateFromVietnamese (3).`,
          );
        }

        const invalidConditionalIndex = payload.findIndex((item) => {
          if (item.exerciseType === ExerciseType.ListenChoose) {
            return !item.distractorSentence?.trim();
          }

          if (item.exerciseType === ExerciseType.TranslateFromVietnamese) {
            return !item.vietnameseTranslation?.trim();
          }

          return false;
        });
        if (invalidConditionalIndex >= 0) {
          throw new Error(
            `Phần tử thứ ${invalidConditionalIndex + 1} thiếu trường bắt buộc theo exerciseType.`,
          );
        }

        await sentenceExerciseService.createMany(payload);

        handleCloseModal();
        await refreshForChapter();
        return payload.length;
      } catch (error) {
        console.error("Lỗi import dialogue:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleCloseModal, refreshForChapter],
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
    handleLevelChange,
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
