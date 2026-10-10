"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [selectedLevelId, setSelectedLevelIdState] = useState<string | null>(
    null,
  );
  const [selectedChapterId, setSelectedChapterIdState] = useState<
    string | null
  >(null);

  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [lessonsByChapter, setLessonsByChapter] = useState<
    Record<string, LessonDto[]>
  >({});
  const [progress, setProgress] = useState<UserProgressDto[]>([]);

  const [loadingLevels, setLoadingLevels] = useState(true);
  const [loadingLevelDetail, setLoadingLevelDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load toàn bộ Level + Progress của user - chỉ cần load 1 lần
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoadingLevels(true);
      setError(null);

      try {
        const [levelResult, progressResult] = await Promise.all([
          roadmapService.getLevels(),
          roadmapService.getMyProgress(),
        ]);

        if (!isMounted) return;

        setLevels(levelResult.items);
        setProgress(progressResult);
        setSelectedLevelIdState(
          (current) => current ?? levelResult.items[0]?.id ?? null,
        );
      } catch {
        if (isMounted) setError("Không thể tải danh sách cấp độ.");
      } finally {
        if (isMounted) setLoadingLevels(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Khi đổi Level -> load toàn bộ Chapter + Lesson của Level đó (load hết,
  // không chỉ chapter đang chọn, để tính được chuỗi unlock xuyên suốt cả Level)
  useEffect(() => {
    if (!selectedLevelId) return;

    let isMounted = true;

    const load = async () => {
      setLoadingLevelDetail(true);
      setError(null);

      try {
        const chapterList =
          await roadmapService.getChaptersByLevel(selectedLevelId);
        if (!isMounted) return;

        const sortedChapters = sortByOrderIndex(chapterList);
        setChapters(sortedChapters);

        const lessonResults = await Promise.all(
          sortedChapters.map((chapter) =>
            roadmapService.getLessonsByChapter(chapter.id),
          ),
        );

        if (!isMounted) return;

        const nextLessonsByChapter: Record<string, LessonDto[]> = {};
        sortedChapters.forEach((chapter, index) => {
          nextLessonsByChapter[chapter.id] = lessonResults[index];
        });
        setLessonsByChapter(nextLessonsByChapter);

        setSelectedChapterIdState((current) => {
          if (current && sortedChapters.some((c) => c.id === current)) {
            return current;
          }
          return sortedChapters[0]?.id ?? null;
        });
      } catch {
        if (isMounted) {
          setError("Không thể tải chapter/lesson của cấp độ này.");
        }
      } finally {
        if (isMounted) setLoadingLevelDetail(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedLevelId]);

  const completedLessonIds = useMemo(() => {
    return new Set(
      progress.filter((p) => p.isCompleted).map((p) => p.lessonId),
    );
  }, [progress]);

  // 3. Ráp Chapter + Lesson thô thành cây có status đầy đủ (completed/unlocked/locked)
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
    () => levels.find((level) => level.id === selectedLevelId) ?? null,
    [levels, selectedLevelId],
  );

  const selectedChapter = useMemo(
    () =>
      roadmapChapters.find((chapter) => chapter.id === selectedChapterId) ??
      roadmapChapters[0] ??
      null,
    [roadmapChapters, selectedChapterId],
  );

  const handleSelectLevel = useCallback((levelId: string) => {
    setSelectedLevelIdState(levelId);
    setSelectedChapterIdState(null); // effect load Chapter/Lesson mới sẽ tự chọn chapter đầu tiên
  }, []);

  const handleSelectChapter = useCallback((chapterId: string) => {
    setSelectedChapterIdState(chapterId);
  }, []);

  // Cập nhật optimistic ở local state sau khi đánh dấu hoàn thành,
  // khỏi phải gọi lại getMyProgress() mất thêm 1 round-trip
  const markLessonCompleted = useCallback(async (lessonId: string) => {
    try {
      await roadmapService.markLessonCompleted(lessonId);
      setProgress((prev) => {
        const exists = prev.some((p) => p.lessonId === lessonId);
        if (exists) {
          return prev.map((p) =>
            p.lessonId === lessonId ? { ...p, isCompleted: true } : p,
          );
        }
        return [...prev, { id: lessonId, lessonId, isCompleted: true }];
      });
    } catch {
      // TODO: thêm toast báo lỗi nếu cần
    }
  }, []);

  return {
    levels,
    selectedLevel,
    selectedLevelId,
    chapters: roadmapChapters,
    selectedChapter,
    selectedChapterId,
    loading: loadingLevels,
    loadingLevelDetail,
    error,
    setSelectedLevelId: handleSelectLevel,
    setSelectedChapterId: handleSelectChapter,
    markLessonCompleted,
  };
}
