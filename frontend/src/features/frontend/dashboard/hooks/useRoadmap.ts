"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { LessonDto } from "@/features/frontend/lesson/types/lesson";
import { roadmapService } from "../services/roadmapService";
import {
  ChapterDto,
  LessonStatus,
  LevelDto,
  RoadmapChapterView,
  RoadmapLessonView,
  UserProgressDto,
} from "../types/roadmap";

const sortByOrderIndex = <T extends { orderIndex: number }>(items: T[]) =>
  [...items].sort((a, b) => a.orderIndex - b.orderIndex);

function buildLessonViews(
  lessons: LessonDto[],
  chapterId: string,
  completedLessonIds: Set<string>,
): RoadmapLessonView[] {
  const sorted = sortByOrderIndex(lessons);

  return sorted.reduce<RoadmapLessonView[]>((acc, lesson, index) => {
    const isCompleted = completedLessonIds.has(lesson.id);
    const previousCompleted =
      index === 0 || acc[index - 1].status === "completed";

    let status: LessonStatus;
    if (isCompleted) {
      status = "completed";
    } else if (previousCompleted) {
      status = "unlocked";
    } else {
      status = "locked";
    }

    acc.push({
      id: lesson.id,
      chapterId,
      title: lesson.title,
      orderIndex: lesson.orderIndex,
      lessonType: lesson.lessonType,
      status,
    });

    return acc;
  }, []);
}

function getChapterStatus(lessons: RoadmapLessonView[]): LessonStatus {
  if (lessons.length === 0) return "locked";
  if (lessons.every((lesson) => lesson.status === "completed")) {
    return "completed";
  }
  if (lessons[0].status === "locked") {
    return "locked";
  }
  return "unlocked";
}

export function useRoadmap() {
  const queryClient = useQueryClient();

  const [selectedLevelId, setSelectedLevelIdState] = useState<string | null>(
    null,
  );
  const [selectedChapterId, setSelectedChapterIdState] = useState<
    string | null
  >(null);

  // ==========================================
  // BÀI TẬP 1: Khởi tạo các Query cơ bản
  // ==========================================
  const levelsQuery = useQuery({
    queryKey: ["levels"],
    queryFn: () => roadmapService.getLevels(),
  });
  const progressQuery = useQuery({
    queryKey: ["user-progress"],
    queryFn: () => roadmapService.getMyProgress(),
  });

  const levels: LevelDto[] = levelsQuery.data?.items ?? [];
  const progress: UserProgressDto[] = progressQuery.data ?? [];

  // Level đang hiệu lực: cái user bấm chọn, hoặc cái đầu tiên nếu chưa chọn gì
  const effectiveLevelId = selectedLevelId ?? levels[0]?.id ?? null;

  // ==========================================
  // BÀI TẬP 2: Dependent Query (chaptersQuery)
  // ==========================================
  const chaptersQuery = useQuery({
    queryKey: ["chapters", effectiveLevelId],
    queryFn: () =>
      roadmapService.getChaptersByLevel(effectiveLevelId as string),
    enabled: !!effectiveLevelId,
  });

  const chapters: ChapterDto[] = useMemo(
    () => sortByOrderIndex(chaptersQuery.data ?? []),
    [chaptersQuery.data],
  );

  // ==========================================
  // BÀI TẬP 3: Đa truy vấn động với useQueries
  // ==========================================
  const lessonQueries = useQueries({
    queries: chapters.map((chapter) => ({
      queryKey: ["lessons", chapter.id],
      queryFn: () => roadmapService.getLessonsByChapter(chapter.id),
    })),
  });

  const loadingLessons = lessonQueries.some((q) => q.isLoading);
  const lessonsUpdatedKey = lessonQueries.map((q) => q.dataUpdatedAt).join(",");
  const lessonsByChapter = useMemo(() => {
    const map: Record<string, LessonDto[]> = {};
    chapters.forEach((chapter, index) => {
      map[chapter.id] = lessonQueries[index]?.data ?? [];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, lessonsUpdatedKey]);

  const completedLessonIds = useMemo(() => {
    return new Set(
      progress.filter((p) => p.isCompleted).map((p) => p.lessonId),
    );
  }, [progress]);

  // 4. Ráp Chapter + Lesson thô thành cây có status đầy đủ
  const roadmapChapters: RoadmapChapterView[] = useMemo(() => {
    return chapters.reduce<RoadmapChapterView[]>((acc, chapter, index) => {
      const lessons = buildLessonViews(
        lessonsByChapter[chapter.id] ?? [],
        chapter.id,
        completedLessonIds,
      );

      const naturalStatus = getChapterStatus(lessons);
      const previousChapterCompleted =
        index === 0 || acc[index - 1].status === "completed";
      const status: LessonStatus = previousChapterCompleted
        ? naturalStatus
        : "locked";

      acc.push({
        id: chapter.id,
        levelId: chapter.levelId,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        lessons,
        status,
      });

      return acc;
    }, []);
  }, [chapters, lessonsByChapter, completedLessonIds]);

  const selectedLevel = useMemo(
    () => levels.find((level) => level.id === effectiveLevelId) ?? null,
    [levels, effectiveLevelId],
  );

  const effectiveChapterId =
    selectedChapterId ?? roadmapChapters[0]?.id ?? null;

  const selectedChapter = useMemo(
    () =>
      roadmapChapters.find((chapter) => chapter.id === effectiveChapterId) ??
      roadmapChapters[0] ??
      null,
    [roadmapChapters, effectiveChapterId],
  );

  const handleSelectLevel = useCallback((levelId: string) => {
    setSelectedLevelIdState(levelId);
    setSelectedChapterIdState(null);
  }, []);

  const handleSelectChapter = useCallback((chapterId: string) => {
    setSelectedChapterIdState(chapterId);
  }, []);

  // ==========================================
  // BÀI TẬP 4: Optimistic Update với useMutation
  // ==========================================
  const markLessonMutation = useMutation({
    mutationFn: (lessonId: string) =>
      roadmapService.markLessonCompleted(lessonId),
    onSuccess: (_data, lessonId) => {
      queryClient.setQueryData<UserProgressDto[]>(["user-progress"], (prev) => {
        const list = prev ?? [];
        const exists = list.some((p) => p.lessonId === lessonId);
        if (exists) {
          return list.map((p) =>
            p.lessonId === lessonId ? { ...p, isCompleted: true } : p,
          );
        }
        return [...list, { id: lessonId, lessonId, isCompleted: true }];
      });
    },
  });

  const markLessonCompleted = useCallback(
    async (lessonId: string) => {
      try {
        await markLessonMutation.mutateAsync(lessonId);
      } catch {
        // TODO: thêm toast báo lỗi nếu cần
      }
    },
    [markLessonMutation],
  );

  const error =
    levelsQuery.isError || progressQuery.isError || chaptersQuery.isError
      ? "Không thể tải dữ liệu lộ trình học."
      : null;

  return {
    levels,
    selectedLevel,
    selectedLevelId: effectiveLevelId,
    chapters: roadmapChapters,
    selectedChapter,
    selectedChapterId: effectiveChapterId,
    loading: levelsQuery.isLoading || progressQuery.isLoading,
    loadingLevelDetail: chaptersQuery.isLoading || loadingLessons,
    error,
    setSelectedLevelId: handleSelectLevel,
    setSelectedChapterId: handleSelectChapter,
    markLessonCompleted,
  };
}
