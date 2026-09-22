// @/features/admin/chapters/services/chapterService.ts

import { apiClient } from "@/lib/apiClient";
import {
  ChapterDto,
  CreateUpdateChapterDto,
} from "@/features/admin/chapters/types/chapter";

interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

interface GetChaptersParams {
  skipCount?: number;
  maxResultCount?: number;
}

export const chapterService = {
  getByLevelId: async (levelId: string): Promise<ChapterDto[]> => {
    const result = await apiClient<ChapterDto[]>(
      `/api/app/chapter/by-level/${levelId}`,
    );
    return [...result].sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getByLevelIdPaged: async (
    levelId: string,
    params: GetChaptersParams = {},
  ): Promise<{ items: ChapterDto[]; totalCount: number }> => {
    const skipCount = params.skipCount ?? 0;
    const maxResultCount = params.maxResultCount ?? 10;

    const result = await apiClient<PagedResultDto<ChapterDto>>(
      `/api/app/chapter/by-level-paged/${levelId}?skipCount=${skipCount}&maxResultCount=${maxResultCount}`,
    );

    const items = (result.items ?? []).sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    return {
      items,
      totalCount: result.totalCount ?? items.length,
    };
  },

  // POST /api/app/chapter
  create: async (input: CreateUpdateChapterDto): Promise<ChapterDto> => {
    return apiClient<ChapterDto>("/api/app/chapter", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  // PUT /api/app/chapter/{id}
  update: async (
    id: string,
    input: CreateUpdateChapterDto,
  ): Promise<ChapterDto> => {
    return apiClient<ChapterDto>(`/api/app/chapter/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  // DELETE /api/app/chapter/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/chapter/${id}`, {
      method: "DELETE",
    });
  },
};

export default chapterService;
