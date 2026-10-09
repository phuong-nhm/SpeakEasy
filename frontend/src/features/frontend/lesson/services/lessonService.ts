import { apiClient } from "@/lib/apiClient";
import {
  CheckSentenceAnswerRequest,
  GrammarNoteDto,
  LessonContentDto,
  LessonSubmitRequest,
  LessonSubmitResponse,
  ListeningPassageClientDto,
  SentenceExerciseDto,
  SubmitListeningEssayRequest,
  SubmitListeningEssayResponse,
  SubmitListeningMultipleChoiceRequest,
  SubmitListeningMultipleChoiceResponse,
  VocabularyDto,
  VocabularyQuizDto,
} from "../types/lesson";

export const lessonService = {
  // ===== LESSON CONTENT (gộp Lesson + Vocabularies + Sentences) =====
  getLessonContent: async (lessonId: string): Promise<LessonContentDto> => {
    return apiClient<LessonContentDto>(
      `/api/app/lesson/lesson-content/${lessonId}`,
      { method: "GET" },
    );
  },

  submitLessonResult: async (
    payload: LessonSubmitRequest,
  ): Promise<LessonSubmitResponse> => {
    return apiClient<LessonSubmitResponse>("/api/app/lesson", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ===== VOCABULARY =====
  getVocabularyByLesson: async (lessonId: string): Promise<VocabularyDto[]> => {
    return apiClient<VocabularyDto[]>(
      `/api/app/vocabulary/by-lesson/${lessonId}`,
      { method: "GET" },
    );
  },

  getVocabularyQuizBatch: async (
    lessonId: string,
  ): Promise<VocabularyQuizDto[]> => {
    return apiClient<VocabularyQuizDto[]>(
      `/api/app/vocabulary/quiz-batch/${lessonId}`,
      { method: "GET" },
    );
  },

  // ===== SENTENCE EXERCISE =====
  submitSentenceAnswer: async (
    input: CheckSentenceAnswerRequest,
  ): Promise<boolean> => {
    return apiClient<boolean>("/api/app/sentence-exercise/check-answer", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getDialogueByChapter: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-dialogue/${chapterId}`,
      { method: "GET" },
    );
  },

  getCheckpointExercises: async (
    chapterId: string,
  ): Promise<SentenceExerciseDto[]> => {
    return apiClient<SentenceExerciseDto[]>(
      `/api/app/sentence-exercise/for-checkpoint/${chapterId}?count=20`,
      { method: "GET" },
    );
  },

  // ===== LISTENING PASSAGE =====
  getPassageByChapter: async (
    chapterId: string,
  ): Promise<ListeningPassageClientDto> => {
    return apiClient<ListeningPassageClientDto>(
      `/api/app/listening-passage/by-chapter/${chapterId}`,
      { method: "GET" },
    );
  },

  submitMultipleChoice: async (
    input: SubmitListeningMultipleChoiceRequest,
  ): Promise<SubmitListeningMultipleChoiceResponse> => {
    return apiClient<SubmitListeningMultipleChoiceResponse>(
      "/api/app/user-listening-answer/submit-multiple-choice",
      { method: "POST", body: JSON.stringify(input) },
    );
  },

  submitEssay: async (
    input: SubmitListeningEssayRequest,
  ): Promise<SubmitListeningEssayResponse> => {
    return apiClient<SubmitListeningEssayResponse>(
      "/api/app/user-listening-answer/submit-essay",
      { method: "POST", body: JSON.stringify(input) },
    );
  },

  // ===== GRAMMAR NOTE =====
  getGrammarNoteByLesson: async (
    lessonId: string,
  ): Promise<GrammarNoteDto | null> => {
    try {
      return await apiClient<GrammarNoteDto>(
        `/api/app/grammar-note/get-by-lesson?lessonId=${encodeURIComponent(lessonId)}`,
        { method: "GET" },
      );
    } catch (error) {
      const apiError = error as Error & { status?: number };
      if (apiError.status === 204 || apiError.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
