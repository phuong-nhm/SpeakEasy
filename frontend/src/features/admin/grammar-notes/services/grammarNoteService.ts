import {
  CreateUpdateGrammarNoteDto,
  GrammarNoteDto,
} from "@/features/admin/grammar-notes/types/grammar-note";
import { apiClient } from "@/lib/apiClient";

interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export const grammarNoteService = {
  getByChapterId: async (chapterId: string): Promise<GrammarNoteDto[]> => {
    try {
      return await apiClient<GrammarNoteDto[]>(
        `/api/app/grammar-note/by-chapter/${chapterId}`,
      );
    } catch {
      return apiClient<GrammarNoteDto[]>(
        `/api/app/grammar-note/get-list-by-chapter?chapterId=${encodeURIComponent(chapterId)}`,
      );
    }
  },

  getByLevelIdPaged: async (
    levelId: string,
    skipCount = 0,
    maxResultCount = 10,
    sorting?: string,
  ): Promise<PagedResultDto<GrammarNoteDto>> => {
    const params = new URLSearchParams({
      SkipCount: String(skipCount),
      MaxResultCount: String(maxResultCount),
    });

    if (sorting?.trim()) {
      params.set("Sorting", sorting.trim());
    }

    try {
      return await apiClient<PagedResultDto<GrammarNoteDto>>(
        `/api/app/grammar-note/by-level-paged/${levelId}?${params.toString()}`,
      );
    } catch {
      return apiClient<PagedResultDto<GrammarNoteDto>>(
        `/api/app/grammar-note/get-list-by-level-paged?levelId=${encodeURIComponent(levelId)}&${params.toString()}`,
      );
    }
  },

  getByLessonId: async (lessonId: string): Promise<GrammarNoteDto | null> => {
    try {
      return await apiClient<GrammarNoteDto>(
        `/api/app/grammar-note/by-lesson/${lessonId}`,
      );
    } catch {
      try {
        return await apiClient<GrammarNoteDto>(
          `/api/app/grammar-note/by-lesson/${lessonId}`,
        );
      } catch {
        return null;
      }
    }
  },

  getList: async (
    skipCount = 0,
    maxResultCount = 10,
    sorting?: string,
  ): Promise<PagedResultDto<GrammarNoteDto>> => {
    const params = new URLSearchParams({
      SkipCount: String(skipCount),
      MaxResultCount: String(maxResultCount),
    });

    if (sorting?.trim()) {
      params.set("Sorting", sorting.trim());
    }

    return apiClient<PagedResultDto<GrammarNoteDto>>(
      `/api/app/grammar-note?${params.toString()}`,
    );
  },

  create: async (
    input: CreateUpdateGrammarNoteDto,
  ): Promise<GrammarNoteDto> => {
    return apiClient<GrammarNoteDto>("/api/app/grammar-note", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update: async (
    id: string,
    input: CreateUpdateGrammarNoteDto,
  ): Promise<GrammarNoteDto> => {
    return apiClient<GrammarNoteDto>(`/api/app/grammar-note/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  createMany: async (
    inputs: CreateUpdateGrammarNoteDto[],
  ): Promise<GrammarNoteDto[]> => {
    return apiClient<GrammarNoteDto[]>("/api/app/grammar-note/many", {
      method: "POST",
      body: JSON.stringify(inputs),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/grammar-note/${id}`, {
      method: "DELETE",
    });
  },
};
