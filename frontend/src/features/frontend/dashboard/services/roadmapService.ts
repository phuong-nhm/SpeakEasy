import { apiClient } from "@/lib/apiClient";
import { LessonDto } from "@/features/frontend/lesson/types/lesson";
import {
  ChapterDto,
  LevelDto,
  PagedResultDto,
  UserProgressDto,
} from "../types/roadmap";

export const roadmapService = {
  // maxResultCount mặc định 100 để tránh bị cắt bớt nếu sau này có nhiều Level
  getLevels: async (
    maxResultCount = 100,
  ): Promise<PagedResultDto<LevelDto>> => {
    return apiClient<PagedResultDto<LevelDto>>(
      `/api/app/level?MaxResultCount=${maxResultCount}`,
      { method: "GET" },
    );
  },

  getChaptersByLevel: async (levelId: string): Promise<ChapterDto[]> => {
    return apiClient<ChapterDto[]>(`/api/app/chapter/by-level/${levelId}`, {
      method: "GET",
    });
  },

  getLessonsByChapter: async (chapterId: string): Promise<LessonDto[]> => {
    return apiClient<LessonDto[]>(`/api/app/lesson/by-chapter/${chapterId}`, {
      method: "GET",
    });
  },

  getMyProgress: async (): Promise<UserProgressDto[]> => {
    return apiClient<UserProgressDto[]>("/api/app/user-progress/my-progress", {
      method: "GET",
    });
  },

  markLessonCompleted: async (lessonId: string): Promise<void> => {
    return apiClient<void>(
      `/api/app/user-progress/mark-lesson-completed/${lessonId}`,
      { method: "POST" },
    );
  },
};
