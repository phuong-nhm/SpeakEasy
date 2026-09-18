"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LevelDto } from "@/features/admin/levels/types/level";
import {
  CreateUpdateListeningPassageDto,
  ListeningPassageDto,
} from "@/features/admin/listening/types/listening";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { levelService } from "@/features/admin/levels/services/levelService";
import { listeningService } from "@/features/admin/listening/services/listeningService";

export function useAdminListening() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [passages, setPassages] = useState<ListeningPassageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refetchPassages = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassage, setEditingPassage] =
    useState<ListeningPassageDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLevels = async () => {
      try {
        const data = await levelService.getList();
        if (!isMounted) return;

        setLevels(data);
        if (data.length > 0) {
          setSelectedLevelId(data[0].id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách level:", error);
      }
    };

    fetchLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedLevelId) {
      setChapters([]);
      setPassages([]);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [chapterData, passageData] = await Promise.all([
          chapterService.getByLevelId(selectedLevelId),
          listeningService.getList(),
        ]);

        if (!isMounted) return;

        setChapters(chapterData);
        if (chapterData.length > 0) {
          setSelectedChapterId((current) => {
            const stillExists = chapterData.some(
              (chapter) => chapter.id === current,
            );
            return stillExists ? current : chapterData[0].id;
          });
        } else {
          setSelectedChapterId("");
        }
        setPassages(passageData);
      } catch (error) {
        console.error("Lỗi lấy danh sách listening:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedLevelId, refreshKey]);

  const visiblePassages = useMemo(() => {
    const chapterOrder = new Map(
      chapters.map((chapter, index) => [chapter.id, index]),
    );

    return [...passages]
      .filter(
        (passage) =>
          chapterOrder.has(passage.chapterId) &&
          (!selectedChapterId || passage.chapterId === selectedChapterId),
      )
      .sort((a, b) => {
        const chapterOrderDiff =
          (chapterOrder.get(a.chapterId) ?? 0) -
          (chapterOrder.get(b.chapterId) ?? 0);
        if (chapterOrderDiff !== 0) return chapterOrderDiff;
        return a.title.localeCompare(b.title);
      });
  }, [chapters, passages, selectedChapterId]);

  const handleLevelChange = useCallback((levelId: string) => {
    setSelectedLevelId(levelId);
  }, []);

  const handleChapterChange = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingPassage(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((passage: ListeningPassageDto) => {
    setEditingPassage(passage);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingPassage(null);
    setIsModalOpen(false);
  }, []);

  const handleGenerateAudio = useCallback(async (transcript: string) => {
    setIsGeneratingAudio(true);
    try {
      return await listeningService.generateAudioFromTranscript(transcript);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateUpdateListeningPassageDto) => {
      setIsSubmitting(true);
      try {
        if (editingPassage) {
          await listeningService.update(editingPassage.id, payload);
        } else {
          await listeningService.create(payload);
        }

        closeModal();
        refetchPassages();
      } catch (error) {
        console.error("Lỗi lưu bài nghe:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeModal, editingPassage, refetchPassages],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa bài nghe này?")) {
        return;
      }

      try {
        await listeningService.delete(id);
        refetchPassages();
      } catch (error) {
        console.error("Lỗi khi xóa bài nghe:", error);
      }
    },
    [refetchPassages],
  );

  return {
    levels,
    selectedLevelId,
    chapters,
    selectedChapterId,
    visiblePassages,
    isLoading,
    isModalOpen,
    editingPassage,
    isSubmitting,
    isGeneratingAudio,
    handleLevelChange,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleGenerateAudio,
    handleSubmit,
    handleDelete,
  };
}
