import { apiClient } from "@/lib/apiClient";
import {
  CheckMatchingAnswerRequest,
  MatchingGameDto,
} from "@/features/frontend/lesson/types/lesson";
import {
  ChapterDto,
  LevelDto,
  PagedResultDto,
} from "@/features/frontend/dashboard/types/roadmap";

export const matchingGameService = {
  getLevels: async (): Promise<PagedResultDto<LevelDto>> => {
    return apiClient<PagedResultDto<LevelDto>>(
      "/api/app/level?MaxResultCount=100",
      { method: "GET" },
    );
  },

  getChaptersByLevel: async (levelId: string): Promise<ChapterDto[]> => {
    return apiClient<ChapterDto[]>(`/api/app/chapter/by-level/${levelId}`, {
      method: "GET",
    });
  },

  getGameForChapter: async (
    chapterId: string,
    count?: number,
  ): Promise<MatchingGameDto> => {
    const query = count ? `?count=${count}` : "";
    return apiClient<MatchingGameDto>(
      `/api/app/matching-game/game-for-chapter/${chapterId}${query}`,
      { method: "GET" },
    );
  },

  checkAnswer: async (input: CheckMatchingAnswerRequest): Promise<boolean> => {
    return apiClient<boolean>("/api/app/matching-game/check-answer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
