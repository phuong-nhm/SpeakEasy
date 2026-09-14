import { useCallback, useEffect, useState } from "react";
import { UserWritingDto } from "@/features/admin/student-writings/types/user-writings";
import userWritingService from "@/features/admin/student-writings/services/userWritingService";

type UserWritingFilter = {
  userId?: string;
  topicId?: string;
};

export function useUserWriting() {
  const [data, setData] = useState<UserWritingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipCount, setSkipCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<UserWritingFilter>({});
  const [selectedWriting, setSelectedWriting] = useState<UserWritingDto | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(
    async (
      nextFilter: UserWritingFilter = filter,
      nextSkipCount = skipCount,
      nextMaxResultCount = maxResultCount,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await userWritingService.getListForAdmin({
          userId: nextFilter.userId,
          topicId: nextFilter.topicId,
          skipCount: nextSkipCount,
          maxResultCount: nextMaxResultCount,
        });

        setData(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load writings.";
        setError(message);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [filter, maxResultCount, skipCount],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadData]);

  const updateFilter = useCallback((nextFilter: Partial<UserWritingFilter>) => {
    setFilter((previous) => ({
      ...previous,
      ...nextFilter,
    }));
    setSkipCount(0);
  }, []);

  const openDetailModal = useCallback(async (writingId: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const writing = await userWritingService.getDetailForAdmin(writingId);
      setSelectedWriting(writing ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch writing detail.";
      setError(message);
      setSelectedWriting(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedWriting(null);
  }, []);

  const deleteWriting = useCallback(
    async (writingId: string) => {
      setLoading(true);
      setError(null);

      try {
        const isDeleted = await userWritingService.deleteWriting(writingId);

        if (!isDeleted) {
          throw new Error("Writing not found.");
        }

        await loadData(filter, skipCount, maxResultCount);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete writing.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filter, loadData, maxResultCount, skipCount],
  );

  return {
    data,
    writings: data,
    loading,
    detailLoading,
    error,
    pagination: {
      skipCount,
      maxResultCount,
      totalCount,
    },
    filter,
    userId: filter.userId,
    topicId: filter.topicId,
    setFilter: updateFilter,
    setUserId: (userId?: string) => updateFilter({ userId }),
    setTopicId: (topicId?: string) => updateFilter({ topicId }),
    setSkipCount,
    setMaxResultCount: (value: number) => {
      setMaxResultCount(value);
      setSkipCount(0);
    },
    searchQuery,
    setSearchQuery,
    selectedWriting,
    openDetailModal,
    closeDetailModal,
    loadData,
    deleteWriting,
  };
}
