import { apiClient } from "@/lib/apiClient";
import {
  SentenceExerciseDto,
  CreateUpdateSentenceExerciseDto,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";

export const sentenceExerciseService = {
  getByLessonId: async (lessonId: string): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/by-lesson/${lessonId}`,
    );
  },

  createMany: async (
    inputs: CreateUpdateSentenceExerciseDto[],
  ): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>("/api/app/sentence-exercise/many", {
      method: "POST",
      body: JSON.stringify(inputs),
    });
  },

  create: async (
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    return apiClient<SentenceExerciseDto>("/api/app/sentence-exercise", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update: async (
    id: string,
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    return apiClient<SentenceExerciseDto>(`/api/app/sentence-exercise/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/sentence-exercise/${id}`, {
      method: "DELETE",
    });
  },
};
