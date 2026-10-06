import { API_BASE_URL, apiClient } from "@/lib/apiClient";
import {
  SentenceExerciseDto,
  CreateUpdateSentenceExerciseDto,
  ExerciseType,
} from "@/features/admin/sentence-exercises/types/sentence-exercise";
import { lessonService } from "@/features/admin/lessons/services/lessonService";

const API_BASE_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

const normalizeAudioUrl = (audioUrl?: string): string | undefined => {
  if (!audioUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(audioUrl)) {
    return audioUrl;
  }

  if (audioUrl.startsWith("/")) {
    return `${API_BASE_URL}${audioUrl}`;
  }

  return `${API_BASE_URL}/${audioUrl}`;
};

const normalizeExercise = (
  exercise: SentenceExerciseDto,
): SentenceExerciseDto => ({
  ...exercise,
  audioUrl: normalizeAudioUrl(exercise.audioUrl),
});

const toRelativeAudioUrl = (audioUrl?: string): string | undefined => {
  if (!audioUrl) {
    return undefined;
  }

  if (audioUrl.startsWith("/")) {
    return audioUrl;
  }

  if (/^https?:\/\//i.test(audioUrl)) {
    try {
      const parsed = new URL(audioUrl);
      if (parsed.origin === API_BASE_ORIGIN) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return audioUrl;
    }
  }

  return `/${audioUrl}`;
};

const normalizeInputForWrite = (
  input: CreateUpdateSentenceExerciseDto,
): CreateUpdateSentenceExerciseDto => ({
  ...input,
  audioUrl: toRelativeAudioUrl(input.audioUrl),
});

export const sentenceExerciseService = {
  getByChapterId: async (chapterId: string): Promise<SentenceExerciseDto[]> => {
    if (!chapterId) {
      return [];
    }

    try {
      const data = await apiClient<SentenceExerciseDto[]>(
        `/api/app/sentence-exercise/for-dialogue?chapterId=${chapterId}`,
      );
      return data.map(normalizeExercise);
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      if (status !== 404) {
        throw error;
      }
    }

    const lessons = await lessonService.getByChapterId(chapterId);
    const byLesson = await Promise.all(
      lessons.map((lesson) => sentenceExerciseService.getByLessonId(lesson.id)),
    );

    return byLesson
      .flat()
      .filter(
        (exercise) =>
          exercise.exerciseType === ExerciseType.ListenChoose &&
          !!exercise.dialogueGroupId,
      )
      .sort((a, b) => {
        const groupCompare = (a.dialogueGroupId || "").localeCompare(
          b.dialogueGroupId || "",
        );
        if (groupCompare !== 0) return groupCompare;
        return (a.orderInGroup ?? 0) - (b.orderInGroup ?? 0);
      });
  },

  getByLessonId: async (lessonId: string): Promise<SentenceExerciseDto[]> => {
    const data = await apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/by-lesson/${lessonId}`,
    );
    return data.map(normalizeExercise);
  },

  createMany: async (
    inputs: CreateUpdateSentenceExerciseDto[],
  ): Promise<SentenceExerciseDto[]> => {
    const normalizedInputs = inputs.map(normalizeInputForWrite);
    const data = await apiClient<SentenceExerciseDto[]>(
      "/api/app/sentence-exercise/many",
      {
        method: "POST",
        body: JSON.stringify(normalizedInputs),
      },
    );
    return data.map(normalizeExercise);
  },

  create: async (
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    const normalizedInput = normalizeInputForWrite(input);
    const data = await apiClient<SentenceExerciseDto>(
      "/api/app/sentence-exercise",
      {
        method: "POST",
        body: JSON.stringify(normalizedInput),
      },
    );
    return normalizeExercise(data);
  },

  update: async (
    id: string,
    input: CreateUpdateSentenceExerciseDto,
  ): Promise<SentenceExerciseDto> => {
    const normalizedInput = normalizeInputForWrite(input);
    const data = await apiClient<SentenceExerciseDto>(
      `/api/app/sentence-exercise/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(normalizedInput),
      },
    );
    return normalizeExercise(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`/api/app/sentence-exercise/${id}`, {
      method: "DELETE",
    });
  },
};
