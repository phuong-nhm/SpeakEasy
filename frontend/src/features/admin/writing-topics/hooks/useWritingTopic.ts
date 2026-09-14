import { useState, useEffect, useCallback } from "react";
import {
  WritingTopicDto,
  CreateUpdateWritingTopicDto,
} from "@/features/admin/writing-topics/types/writing-topic";
import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { LevelDto } from "@/features/admin/levels/types/level";

import { writingTopicService } from "@/features/admin/writing-topics/services/writingTopicService";
import { chapterService } from "@/features/admin/chapters/services/chapterService";
import { levelService } from "@/features/admin/levels/services/levelService";

export function useWritingTopic() {
  // State danh sách
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [topics, setTopics] = useState<WritingTopicDto[]>([]);

  // State selection
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Modal Control State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<WritingTopicDto | null>(
    null,
  );

  // 1. Fetch danh sách Levels ban đầu khi mount
  useEffect(() => {
    let isMounted = true;

    const fetchLevels = async () => {
      setLoading(true);
      try {
        const data = await levelService.getList();
        if (!isMounted) return;

        setLevels(data);
        if (data.length > 0) {
          setSelectedLevelId(data[0].id);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch levels:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch danh sách Chapters khi selectedLevelId thay đổi
  useEffect(() => {
    let isMounted = true;

    const fetchChapters = async () => {
      // Đưa kiểm tra điều kiện rỗng vào trong async function
      if (!selectedLevelId) {
        setChapters([]);
        setSelectedChapterId("");
        return;
      }

      setLoading(true);
      try {
        const data = await chapterService.getByLevelId(selectedLevelId);
        if (!isMounted) return;

        setChapters(data);
        if (data.length > 0) {
          setSelectedChapterId(data[0].id);
        } else {
          setSelectedChapterId("");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch chapters:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChapters();

    return () => {
      isMounted = false;
    };
  }, [selectedLevelId]);

  // 3. Fetch tất cả Topics khi mount
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await writingTopicService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Chuyển việc gọi fetchTopics vào microtask để không bị trùng luồng render sync
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchTopics();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchTopics]);

  // Lọc bài viết theo Chapter được chọn
  const filteredTopics = topics.filter(
    (t) => t.chapterId === selectedChapterId,
  );

  // Modal Actions
  const openAddModal = () => {
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  const openEditModal = (topic: WritingTopicDto) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTopic(null);
  };

  // POST /api/app/writing-topic
  const createTopic = async (input: CreateUpdateWritingTopicDto) => {
    setLoading(true);
    try {
      const newTopic = await writingTopicService.createTopic(input);
      setTopics((prev) => [...prev, newTopic]);
      closeModal();
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setLoading(false);
    }
  };

  // PUT /api/app/writing-topic/{id}
  const updateTopic = async (
    id: string,
    input: CreateUpdateWritingTopicDto,
  ) => {
    setLoading(true);
    try {
      const updated = await writingTopicService.updateTopic(id, input);
      setTopics((prev) => prev.map((t) => (t.id === id ? updated : t)));
      closeModal();
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE /api/app/writing-topic/{id}
  const deleteTopic = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chủ đề bài viết này?")) {
      setLoading(true);
      try {
        await writingTopicService.deleteTopic(id);
        await setTopics((prev) => prev.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Failed to delete topic:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    levels,
    selectedLevelId,
    setSelectedLevelId,
    chapters,
    selectedChapterId,
    setSelectedChapterId,
    filteredTopics,
    loading,
    isModalOpen,
    editingTopic,
    openAddModal,
    openEditModal,
    closeModal,
    createTopic,
    updateTopic,
    deleteTopic,
    refetchTopics: fetchTopics,
  };
}
