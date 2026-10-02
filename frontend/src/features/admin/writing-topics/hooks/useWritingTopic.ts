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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Modal Control State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<WritingTopicDto | null>(
    null,
  );

  // 1. Fetch levels khi mount
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

  // 2. Fetch chapters khi selectedLevelId thay đổi
  useEffect(() => {
    let isMounted = true;

    const fetchChapters = async () => {
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

  // 3. Fetch topics theo level với phân trang
  const fetchTopics = useCallback(
    async (page = 1) => {
      if (!selectedLevelId) {
        setTopics([]);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      try {
        const skipCount = (page - 1) * pageSize;
        const result = await writingTopicService.getTopicsByLevel(
          selectedLevelId,
          skipCount,
          pageSize,
        );
        setTopics(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        setTopics([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [selectedLevelId, pageSize],
  );

  // Gọi fetchTopics khi selectedLevelId thay đổi
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchTopics(1); // Reset về page 1 khi đổi level
    }

    return () => {
      isMounted = false;
    };
  }, [fetchTopics]);

  // Backend đang fetch theo Level, nên không filter client-side theo Chapter.
  // Việc filter ở đây làm sai pagination vì page đang tính trên toàn dataset level.
  const filteredTopics = topics;

  // Pagination handler
  const handlePageChange = useCallback(
    async (nextPage: number) => {
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
      await fetchTopics(normalizedPage);
    },
    [fetchTopics, totalCount, pageSize],
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

  const createTopic = async (input: CreateUpdateWritingTopicDto) => {
    setLoading(true);
    try {
      await writingTopicService.createTopic(input);
      closeModal();
      await fetchTopics(currentPage);
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (
    id: string,
    input: CreateUpdateWritingTopicDto,
  ) => {
    setLoading(true);
    try {
      await writingTopicService.updateTopic(id, input);
      closeModal();
      await fetchTopics(currentPage);
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTopic = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chủ đề bài viết này?")) {
      setLoading(true);
      try {
        await writingTopicService.deleteTopic(id);
        await fetchTopics(currentPage);
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
    topics,
    loading,
    isModalOpen,
    editingTopic,
    currentPage,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    openAddModal,
    openEditModal,
    closeModal,
    createTopic,
    updateTopic,
    deleteTopic,
    handlePageChange,
  };
}
