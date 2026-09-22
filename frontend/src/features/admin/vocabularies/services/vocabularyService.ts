import {
  VocabularyDto,
  CreateUpdateVocabularyDto,
} from "@/features/admin/vocabularies/types/vocabulary";
import { apiClient } from "@/lib/apiClient";

export const vocabularyService = {
  getByLessonId: async (lessonId: string): Promise<VocabularyDto[]> => {
    try {
      return await apiClient<VocabularyDto[]>(
        `/api/app/vocabulary/by-lesson/${lessonId}`,
      );
    } catch {
      // Fallback for environments exposing the conventional ABP query route.
      return apiClient<VocabularyDto[]>(
        `/api/app/vocabulary/get-list-by-lesson?lessonId=${encodeURIComponent(lessonId)}`,
      );
    }
  },

  create: async (data: CreateUpdateVocabularyDto): Promise<VocabularyDto> => {
    return apiClient<VocabularyDto>("/api/app/vocabulary", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: string,
    data: CreateUpdateVocabularyDto,
  ): Promise<VocabularyDto> => {
    return apiClient<VocabularyDto>(`/api/app/vocabulary/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/vocabulary/${id}`, {
      method: "DELETE",
    });
  },

  createMany: async (
    items: CreateUpdateVocabularyDto[],
  ): Promise<VocabularyDto[]> => {
    return apiClient<VocabularyDto[]>("/api/app/vocabulary/create-many", {
      method: "POST",
      body: JSON.stringify(items),
    });
  },
};

export default vocabularyService;
